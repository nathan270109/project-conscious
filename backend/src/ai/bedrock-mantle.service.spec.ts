import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BedrockMantleHttpError,
  BedrockMantleService,
  DEFAULT_MODEL_ID,
  DEFAULT_REGION,
  mantleEndpoint,
  modelEnv,
  signedHeaders,
} from './bedrock-mantle.service.js';
import { CONSCIOUS_SYSTEM_PROMPT } from './ai-chat-context.js';

describe('modelEnv', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('usa os defaults do projeto quando o env não define', () => {
    vi.stubEnv('CONSCIOUS_AI_MODEL', undefined);
    vi.stubEnv('AWS_REGION', undefined);
    expect(modelEnv()).toEqual({ modelId: DEFAULT_MODEL_ID, region: DEFAULT_REGION });
  });

  it('respeita o modelo e a região definidos por env', () => {
    vi.stubEnv('CONSCIOUS_AI_MODEL', 'google.gemma-4-e2b');
    vi.stubEnv('AWS_REGION', 'sa-east-1');
    expect(modelEnv()).toEqual({ modelId: 'google.gemma-4-e2b', region: 'sa-east-1' });
  });
});

describe('mantleEndpoint', () => {
  it('monta o host e a rota OpenAI-compatível', () => {
    expect(mantleEndpoint(DEFAULT_REGION)).toEqual({
      host: 'bedrock-mantle.us-east-1.api.aws',
      path: '/openai/v1/chat/completions',
      url: 'https://bedrock-mantle.us-east-1.api.aws/openai/v1/chat/completions',
    });
  });
});

describe('signedHeaders', () => {
  it('produz cabeçalhos assinados para a região, o serviço e o payload', () => {
    const headers = signedHeaders({
      host: 'bedrock-mantle.us-east-1.api.aws',
      payload: new TextEncoder().encode('{"x":1}'),
      credentials: {
        accessKeyId: 'AKIDEXAMPLE',
        secretAccessKey: 'segredo',
        sessionToken: 'token-temporário',
      },
      region: 'us-east-1',
      now: new Date('2026-10-13T12:00:00.000Z'),
    });

    expect(headers.get('host')).toBe('bedrock-mantle.us-east-1.api.aws');
    expect(headers.get('x-amz-date')).toBe('20261013T120000Z');
    expect(headers.get('x-amz-security-token')).toBe('token-temporário');
    expect(headers.get('x-amz-content-sha256')).toEqual(
      expect.stringMatching(/^[0-9a-f]{64}$/),
    );
    expect(headers.get('authorization')).toMatch(
      /^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/20261013\/us-east-1\/bedrock-mantle\/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature=[0-9a-f]{64}$/,
    );
  });
});

describe('BedrockMantleService.complete', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const providerWithCredentials = () => ({
    resolve: vi.fn().mockResolvedValue({
      accessKeyId: 'AKIDTEST',
      secretAccessKey: 'segredo',
      sessionToken: 'token',
    }),
  });

  it('exige credenciais ausentes como erro HTTP 401', async () => {
    const provider = {
      resolve: vi.fn().mockRejectedValue(new BedrockMantleHttpError(401)),
    };
    await expect(
      new BedrockMantleService(provider as never).complete([]),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('post /openai/v1/chat/completions com assinatura e devolve a resposta', async () => {
    const provider = providerWithCredentials();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: '  resposta  ' } }] }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await new BedrockMantleService(provider as never).complete([
      { role: 'system', content: CONSCIOUS_SYSTEM_PROMPT },
      { role: 'user', content: 'pergunta' },
    ]);

    expect(result).toEqual({ answer: 'resposta', modelId: DEFAULT_MODEL_ID });
    expect(provider.resolve).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(mantleEndpoint(DEFAULT_REGION).url);
    const headers = init.headers as Record<string, string>;
    expect(headers['content-type']).toBe('application/json');
    expect(headers['authorization']).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIDTEST\//);
    expect(JSON.parse(new TextDecoder().decode(init.body as Uint8Array))).toMatchObject({
      model: DEFAULT_MODEL_ID,
      reasoning_effort: 'high',
      max_completion_tokens: 2048,
    });
  });

  it('mapeia status HTTP para BedrockMantleHttpError', async () => {
    const provider = providerWithCredentials();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('limitado', { status: 429 })));
    await expect(
      new BedrockMantleService(provider as never).complete([]),
    ).rejects.toMatchObject({ status: 429 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('estourou', { status: 500 })));
    await expect(
      new BedrockMantleService(provider as never).complete([]),
    ).rejects.toBeInstanceOf(BedrockMantleHttpError);
  });

  it('falha quando o payload do modelo não traz conteúdo', async () => {
    const provider = providerWithCredentials();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [] }), { status: 200 })),
    );
    await expect(
      new BedrockMantleService(provider as never).complete([]),
    ).rejects.toMatchObject({ status: 502 });
  });
});
