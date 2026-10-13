import { createHash, createHmac } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ChatMessage } from './ai-chat-context.js';
import { AwsCredentialProvider } from './aws-credentials.service.js';

export const DEFAULT_MODEL_ID = 'google.gemma-4-e2b';
export const DEFAULT_REGION = 'us-east-1';
const SERVICE = 'bedrock-mantle';
const REQUEST_TIMEOUT_MS = 38_000;

export class BedrockMantleHttpError extends Error {
  constructor(readonly status: number) {
    super(`bedrock-mantle HTTP ${status}`);
    this.name = 'BedrockMantleHttpError';
  }
}

export function modelEnv(): { modelId: string; region: string } {
  return {
    modelId: process.env['CONSCIOUS_AI_MODEL']?.trim() || DEFAULT_MODEL_ID,
    region: process.env['AWS_REGION']?.trim() || DEFAULT_REGION,
  };
}

export function mantleEndpoint(region: string): { host: string; url: string; path: string } {
  const host = `bedrock-mantle.${region}.api.aws`;
  const path = '/openai/v1/chat/completions';
  return { host, url: `https://${host}${path}`, path };
}

export function signedHeaders(options: {
  host: string;
  payload: Uint8Array;
  credentials: { accessKeyId: string; secretAccessKey: string; sessionToken?: string };
  region: string;
  now?: Date;
}): Map<string, string> {
  const { host, payload, credentials, region } = options;
  const now = options.now ?? new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = createHash('sha256').update(payload).digest('hex');

  const headers = new Map<string, string>([
    ['host', host],
    ['x-amz-date', amzDate],
    ['x-amz-content-sha256', payloadHash],
  ]);
  if (credentials.sessionToken) headers.set('x-amz-security-token', credentials.sessionToken);

  const sorted = [...headers.entries()].sort(([a], [b]) => a.localeCompare(b));
  const canonicalHeaders = sorted.map(([k, v]) => `${k}:${v.trim()}\n`).join('');
  const signedHeadersList = sorted.map(([k]) => k).join(';');
  const canonicalRequest = [
    'POST',
    '/openai/v1/chat/completions',
    '',
    canonicalHeaders,
    signedHeadersList,
    payloadHash,
  ].join('\n');

  const scope = `${dateStamp}/${region}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const hmac = (key: Buffer | string, message: string) =>
    createHmac('sha256', key).update(message).digest();
  const dateKey = hmac(`AWS4${credentials.secretAccessKey}`, dateStamp);
  const signingKey = hmac(hmac(hmac(dateKey, region), SERVICE), 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  headers.set('authorization', `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`);
  return headers;
}

export interface MantleResult {
  answer: string;
  modelId: string;
}

@Injectable()
export class BedrockMantleService {
  constructor(private readonly awsCredentials: AwsCredentialProvider) {}

  async complete(messages: ChatMessage[]): Promise<MantleResult> {
    // Credenciais sempre frescas: o provedor resolve do perfil AWS local e
    // re-resolve automaticamente quando o token expira, sem reiniciar o app.
    const credentials = await this.awsCredentials.resolve();

    const { modelId, region } = modelEnv();
    const { host, url } = mantleEndpoint(region);
    const payload = new TextEncoder().encode(
      JSON.stringify({
        model: modelId,
        messages,
        reasoning_effort: 'high',
        max_completion_tokens: 2_048,
        service_tier: 'default',
      }),
    );
    const headers = signedHeaders({ host, payload, credentials, region });
    headers.set('content-type', 'application/json');

    const response = await fetch(url, {
      method: 'POST',
      body: payload,
      headers: Object.fromEntries(headers),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new BedrockMantleHttpError(response.status);

    const result: unknown = await response.json();
    const answer = (result as { choices?: unknown[] } | null)?.choices?.[0];
    const content = (answer as { message?: { content?: unknown } } | null)?.message?.content;
    if (typeof content !== 'string' || !content.trim())
      throw new BedrockMantleHttpError(502);
    return { answer: content.trim(), modelId };
  }
}
