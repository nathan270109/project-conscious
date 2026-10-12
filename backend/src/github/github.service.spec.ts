import {
  BadRequestException,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { vi } from 'vitest';
import { CLONE_LIMITS, GithubService } from './github.service.js';

type Internals = {
  storageRoot: string;
  git: (args: string[], signal: AbortSignal) => Promise<string>;
  directoryBytes: (path: string) => Promise<number>;
  cleanupDirectory: (path: string) => Promise<void>;
};
const url = 'https://github.com/octocat/Hello-World';
const sha = 'a'.repeat(40);
const entry = (path: string, size = 8, mode = '100644') =>
  `${mode} blob ${sha} ${size}\t${path}\0`;

describe('GithubService — clone temporário', () => {
  let service: GithubService;
  let root: string;
  let git: ReturnType<typeof vi.spyOn<Internals, 'git'>>;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'conscious-test-'));
    service = new GithubService();
    const internal = service as unknown as Internals;
    internal.storageRoot = root;
    git = vi.spyOn(internal, 'git').mockImplementation(async (args) => {
      if (args[0] === 'clone') return '';
      if (args.includes('ls-tree'))
        return entry('README.md') + entry('src/app.ts') + entry('index.html');
      return '# README';
    });
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it('rejeita URL inválida antes de criar pasta ou iniciar Git', async () => {
    await expect(
      service.getRepositoryFiles('https://evil.example/repo'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(git).not.toHaveBeenCalled();
    expect(await readdir(root)).toEqual([]);
  });

  it('encerramento do backend cancela clone ativo, aguarda limpeza e bloqueia novos scans', async () => {
    git.mockImplementationOnce(
      (_args, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new Error('shutdown')),
            { once: true },
          );
        }),
    );
    const pending = expect(
      service.getRepositoryFiles(url),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    await vi.waitFor(() => expect(git).toHaveBeenCalled());
    await service.onModuleDestroy();
    await pending;
    expect(await readdir(root)).toEqual([]);
    await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('clona só a branch padrão e mantém a pasta até o motor terminar', async () => {
    await writeFile(join(root, 'preservar.txt'), 'não excluir');
    const result = await service.withRepositoryFiles(url, async (files) => {
      expect(files.map((file) => file.path)).toEqual([
        'README.md',
        'src/app.ts',
        'index.html',
      ]);
      expect(
        (await readdir(root)).filter((name) => name.startsWith('scan-')),
      ).toHaveLength(1);
      return 74;
    });
    expect(result).toBe(74);
    expect(git.mock.calls[0][0]).toEqual([
      'clone',
      '--bare',
      '--depth=1',
      '--single-branch',
      '--no-tags',
      '--template=',
      '--',
      url + '.git',
      expect.stringMatching(/scan-.*[\\/]repository\.git$/),
    ]);
    expect(await readdir(root)).toEqual(['preservar.txt']);
  });

  it('remove a cópia mesmo se o motor falhar, preservando o erro original', async () => {
    const error = new Error('motor indisponível');
    await expect(
      service.withRepositoryFiles(url, () => {
        throw error;
      }),
    ).rejects.toBe(error);
    expect(await readdir(root)).toEqual([]);
  });

  it.each([
    'Repository not found',
    'could not read Username',
    'Authentication failed',
  ])('rejeita privado/inexistente sem credenciais: %s', async (message) => {
    git.mockRejectedValueOnce(new Error(message));
    await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(await readdir(root)).toEqual([]);
  });

  it('remove clone parcial quando a conexão falha e libera a vaga', async () => {
    git.mockRejectedValueOnce(new Error('network failed'));
    await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(await readdir(root)).toEqual([]);
    await expect(service.getRepositoryFiles(url)).resolves.toHaveLength(3);
  });

  it('exclui dependências, builds, links e submódulos sem ler seu conteúdo', async () => {
    git.mockImplementation(async (args) => {
      if (args.includes('ls-tree'))
        return (
          entry('src/test.spec.ts') +
          entry('node_modules/a.js') +
          entry('dist/app.js') +
          entry('build/app.js') +
          entry('coverage/app.js') +
          entry('vendor/a.js') +
          entry('link.ts', 8, '120000') +
          `160000 commit ${sha} -\tmodule\0`
        );
      return '';
    });
    expect(
      (await service.getRepositoryFiles(url)).map((file) => file.path),
    ).toEqual(['src/test.spec.ts']);
    expect(
      git.mock.calls.filter(([args]) => args.includes('cat-file')),
    ).toHaveLength(1);
  });

  it.each([
    entry('large.ts', CLONE_LIMITS.fileBytes + 1),
    entry('a.ts').repeat(CLONE_LIMITS.files + 1),
    entry('a.png').repeat(CLONE_LIMITS.entries + 1),
    entry('large.ts', CLONE_LIMITS.fileBytes).repeat(21),
  ])(
    'falha em excesso de arquivos/bytes, sem análise parcial',
    async (tree) => {
      git.mockImplementation(async (args) =>
        args.includes('ls-tree') ? tree : '',
      );
      const consume = vi.fn();
      await expect(
        service.withRepositoryFiles(url, consume),
      ).rejects.toBeInstanceOf(PayloadTooLargeException);
      expect(consume).not.toHaveBeenCalled();
      expect(await readdir(root)).toEqual([]);
    },
  );

  it('rejeita clone acima de 100 MiB e remove a pasta', async () => {
    vi.spyOn(
      service as unknown as Internals,
      'directoryBytes',
    ).mockResolvedValue(CLONE_LIMITS.cloneBytes + 1);
    await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
      PayloadTooLargeException,
    );
    expect(await readdir(root)).toEqual([]);
  });

  it('rejeita conteúdo binário relevante', async () => {
    git.mockImplementation(async (args) =>
      args.includes('ls-tree') ? entry('a.ts') : '\0',
    );
    await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(await readdir(root)).toEqual([]);
  });

  it('interrompe um clone em andamento quando o monitor detecta excesso de disco', async () => {
    vi.spyOn(
      service as unknown as Internals,
      'directoryBytes',
    ).mockResolvedValue(CLONE_LIMITS.cloneBytes + 1);
    git.mockImplementationOnce(
      (_args, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          });
        }),
    );
    await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
      PayloadTooLargeException,
    );
    expect(await readdir(root)).toEqual([]);
  });

  it('não devolve sucesso se a limpeza falhar e libera a vaga', async () => {
    const cleanup = vi
      .spyOn(service as unknown as Internals, 'cleanupDirectory')
      .mockRejectedValueOnce(new ServiceUnavailableException('limpeza falhou'));
    await expect(
      service.withRepositoryFiles(url, () => 74),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    cleanup.mockRestore();
    await expect(service.getRepositoryFiles(url)).resolves.toHaveLength(3);
  });

  it('mantém pastas distintas em duas análises e recusa a terceira', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const first = service.withRepositoryFiles(url, async () => gate);
    const second = service.withRepositoryFiles(url, async () => gate);
    try {
      await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      await vi.waitFor(() =>
        expect(
          git.mock.calls.filter(([args]) => args[0] === 'clone'),
        ).toHaveLength(2),
      );
      expect(
        new Set(
          git.mock.calls
            .filter(([args]) => args[0] === 'clone')
            .map(([args]) => args.at(-1)),
        ).size,
      ).toBe(2);
    } finally {
      release();
      await Promise.all([first, second]);
    }
    expect(await readdir(root)).toEqual([]);
  });

  it('interrompe o clone ao expirar o prazo e remove a pasta', async () => {
    const timer = vi.spyOn(globalThis, 'setTimeout');
    git.mockImplementationOnce(
      (_args, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          });
          queueMicrotask(() => {
            const callback = timer.mock.calls.find(
              ([, ms]) => ms === CLONE_LIMITS.durationMs,
            )?.[0];
            if (typeof callback === 'function') callback();
          });
        }),
    );
    await expect(service.getRepositoryFiles(url)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(await readdir(root)).toEqual([]);
  });
});
