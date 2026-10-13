import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AwsCredentialProvider, parseCredentialExport } from './aws-credentials.service.js';
import { BedrockMantleHttpError } from './bedrock-mantle.service.js';

const childProcess = vi.hoisted(() => ({ execFile: vi.fn() }));

vi.mock('node:child_process', () => childProcess);

const FUTURE = new Date(Date.now() + 60 * 60 * 1000).toISOString();

function stubExport(values: Record<string, string>, fail?: Error | 'fail' | 'timeout') {
  childProcess.execFile.mockImplementation(
    (cmd: string, args: string[], opts: object, callback: (e: unknown, r: { stdout: string }) => void) => {
      if (fail === 'fail') return callback(new Error('perfil inexistente'), { stdout: '' });
      if (fail === 'timeout') return callback(new Error('ETIMEDOUT'), { stdout: '' });
      const stdout = Object.entries(values)
        .map(([key, value]) => `export ${key}=${value}`)
        .join('\n');
      callback(null, { stdout });
    },
  );
}

describe('parseCredentialExport', () => {
  it("extrai chaves com aspas, casos especiais e ignora linhas estranhas", () => {
    expect(
      parseCredentialExport(
        '\nexport AWS_ACCESS_KEY_ID=AKID1\nexport AWS_SECRET_ACCESS_KEY="a=/bcd+E"\nexport AWS_SESSION_TOKEN=\'x/y=\'\nLIHA_SEM_CHAVE=1\n',
      ),
    ).toEqual({ AWS_ACCESS_KEY_ID: 'AKID1', AWS_SECRET_ACCESS_KEY: 'a=/bcd+E', AWS_SESSION_TOKEN: 'x/y=' });
    expect(parseCredentialExport('')).toEqual({});
  });
});

describe('AwsCredentialProvider.resolve', () => {
  const stubBase = () => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', undefined);
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', undefined);
    vi.stubEnv('AWS_SESSION_TOKEN', undefined);
    vi.stubEnv('AWS_CREDENTIAL_EXPIRATION', undefined);
    vi.stubEnv('AWS_PROFILE', undefined);
  };

  beforeEach(stubBase);

  afterEach(() => {
    vi.unstubAllEnvs();
    childProcess.execFile.mockReset();
  });

  it('resolve credenciais pelo CLI local e usa cache válido', async () => {
    stubExport({ AWS_ACCESS_KEY_ID: 'AKIDCLI', AWS_SECRET_ACCESS_KEY: 's', AWS_CREDENTIAL_EXPIRATION: FUTURE });
    const provider = new AwsCredentialProvider();

    await expect(provider.resolve()).resolves.toMatchObject({
      accessKeyId: 'AKIDCLI',
      sessionToken: undefined,
    });
    await expect(provider.resolve()).resolves.toMatchObject({ accessKeyId: 'AKIDCLI' });

    const chamadas = childProcess.execFile.mock.calls as unknown[];
    expect(chamadas).toHaveLength(1);
  });

  it('re-resolve quando a credencial cacheada expira', async () => {
    const primeiro = new Date(Date.now() + 2_000).toISOString();
    stubExport({ AWS_ACCESS_KEY_ID: 'AKIDA', AWS_SECRET_ACCESS_KEY: 's', AWS_CREDENTIAL_EXPIRATION: primeiro });
    const provider = new AwsCredentialProvider();
    await provider.resolve();

    stubExport({ AWS_ACCESS_KEY_ID: 'AKIDB', AWS_SECRET_ACCESS_KEY: 's', AWS_CREDENTIAL_EXPIRATION: FUTURE });
    await expect(provider.resolve()).resolves.toMatchObject({ accessKeyId: 'AKIDB' });
  });

  it('usa credenciais estáticas do env como fallback do perfil local falho', async () => {
    stubExport({}, 'fail');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'AKIDENV');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 's');
    vi.stubEnv('AWS_CREDENTIAL_EXPIRATION', FUTURE);

    await expect(new AwsCredentialProvider().resolve()).resolves.toMatchObject({
      accessKeyId: 'AKIDENV',
    });
  });

  it('falha 401 sem CLI válido e sem fallback', async () => {
    stubExport({}, 'fail');
    const provider = new AwsCredentialProvider();
    await expect(provider.resolve()).rejects.toMatchObject({ status: 401 });
    await expect(provider.resolve()).rejects.toMatchObject({ status: 401 });
    expect(childProcess.execFile.mock.calls as unknown as unknown[]).toHaveLength(1);
  });

  it('rejeita credencial estática expirada quando o perfil local também falha', async () => {
    stubExport({}, 'fail');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'AKIDVELHO');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 's');
    vi.stubEnv('AWS_CREDENTIAL_EXPIRATION', '2020-01-01T00:00:00.000Z');

    await expect(new AwsCredentialProvider().resolve()).rejects.toBeInstanceOf(
      BedrockMantleHttpError,
    );
  });
});
