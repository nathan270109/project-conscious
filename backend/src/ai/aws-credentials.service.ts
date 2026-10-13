import { execFile } from 'node:child_process';
import { Injectable } from '@nestjs/common';
import { promisify } from 'node:util';
import { BedrockMantleHttpError } from './bedrock-mantle.service.js';

const execFileAsync = promisify(execFile);

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

/** Fallback de validade quando o export não informa expiração (minutos). */
const UNDATED_CACHE_MS = 10 * 60 * 1000;
/** Cache negativo para não reexecutar o CLI inexistente/falho em cada chamada. */
const NEGATIVE_CACHE_MS = 5 * 60 * 1000;

@Injectable()
export class AwsCredentialProvider {
  private cached:
    | { credentials: AwsCredentials; expiresAt: number | null }
    | { negative: true; until: number }
    | undefined;

  async resolve(): Promise<AwsCredentials> {
    const now = Date.now();
    if (this.cached && 'negative' in this.cached && this.cached.until > now)
      throw new BedrockMantleHttpError(401);
    if (this.cached && 'credentials' in this.cached) {
      const expired =
        this.cached.expiresAt !== null && this.cached.expiresAt <= now;
      if (!expired) return this.cached.credentials;
      this.cached = undefined;
    }

    try {
      const profile = process.env['AWS_PROFILE']?.trim() || 'default';
      const { stdout } = await execFileAsync(
        'aws',
        ['configure', 'export-credentials', '--profile', profile, '--format', 'env'],
        { timeout: 15_000 },
      );
      const parsed = parseCredentialExport(stdout);
      if (parsed.AWS_ACCESS_KEY_ID && parsed.AWS_SECRET_ACCESS_KEY) {
        const credentials: AwsCredentials = {
          accessKeyId: parsed.AWS_ACCESS_KEY_ID,
          secretAccessKey: parsed.AWS_SECRET_ACCESS_KEY,
          sessionToken: parsed.AWS_SESSION_TOKEN || undefined,
        };
        const expiresAt = parsed.AWS_CREDENTIAL_EXPIRATION
          ? Date.parse(parsed.AWS_CREDENTIAL_EXPIRATION)
          : null;
        this.cached = {
          credentials,
          expiresAt:
            expiresAt && Number.isFinite(expiresAt)
              ? expiresAt - 60_000
              : now + UNDATED_CACHE_MS,
        };
        return credentials;
      }
      throw new Error('export sem credenciais');
    } catch {
      const staticCredentials = envCredentials();
      if (staticCredentials) {
        const expiresAt = envExpiration() ?? now + UNDATED_CACHE_MS;
        if (expiresAt <= now) throw new BedrockMantleHttpError(401);
        this.cached = { credentials: staticCredentials, expiresAt };
        return staticCredentials;
      }
      this.cached = { negative: true, until: now + NEGATIVE_CACHE_MS };
      throw new BedrockMantleHttpError(401);
    }
  }
}

function envCredentials(): AwsCredentials | null {
  const accessKeyId = process.env['AWS_ACCESS_KEY_ID']?.trim();
  const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY']?.trim();
  if (!accessKeyId || !secretAccessKey) return null;
  return {
    accessKeyId,
    secretAccessKey,
    sessionToken: process.env['AWS_SESSION_TOKEN']?.trim() || undefined,
  };
}

function envExpiration(): number | null {
  const raw = process.env['AWS_CREDENTIAL_EXPIRATION']?.trim();
  if (!raw) return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed - 60_000 : null;
}

export function parseCredentialExport(stdout: string): Record<string, string> {
  const credentials: Record<string, string> = {};
  for (const line of String(stdout).split('\n')) {
    const match = line.match(/^export (AWS_[A-Z_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2];
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    credentials[match[1]] = value;
  }
  return credentials;
}
