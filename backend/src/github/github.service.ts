import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { mkdir, mkdtemp, readdir, lstat, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseGithubRepositoryUrl } from './repository-url.js';
import { runGit } from './git-command.js';

export interface RepositoryFile {
  path: string;
  content?: string;
}

export const CLONE_LIMITS = {
  concurrent: 2,
  durationMs: 45_000,
  cloneBytes: 100 * 1024 * 1024,
  entries: 10_000,
  files: 2_000,
  fileBytes: 1024 * 1024,
  contentBytes: 20 * 1024 * 1024,
} as const;

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly storageRoot = resolve(process.cwd(), '.analysis-tmp');
  private active = 0;
  private readonly controllers = new Set<AbortController>();
  private shuttingDown = false;

  async onModuleDestroy(): Promise<void> {
    this.shuttingDown = true;
    for (const controller of this.controllers) controller.abort();
    const deadline = Date.now() + 5000;
    while (this.active > 0 && Date.now() < deadline) {
      await new Promise((done) => setTimeout(done, 20));
    }
    if (this.active > 0)
      this.logger.warn(
        'Há uma análise que não terminou a limpeza no prazo de encerramento.',
      );
  }

  parseRepositoryUrl(repositoryUrl: string): { owner: string; repo: string } {
    const reference = parseGithubRepositoryUrl(repositoryUrl);
    if (!reference)
      throw new BadRequestException(
        'Informe uma URL válida, como https://github.com/owner/repo',
      );
    return reference;
  }

  getRepositoryFiles(repositoryUrl: string): Promise<RepositoryFile[]> {
    return this.withRepositoryFiles(repositoryUrl, (files) => files);
  }

  async withRepositoryFiles<T>(
    repositoryUrl: string,
    consume: (files: RepositoryFile[]) => T | Promise<T>,
  ): Promise<T> {
    const { owner, repo } = this.parseRepositoryUrl(repositoryUrl);
    if (this.shuttingDown)
      throw new ServiceUnavailableException(
        'Servidor encerrando. Tente novamente depois de reiniciá-lo.',
      );
    if (this.active >= CLONE_LIMITS.concurrent)
      throw new ServiceUnavailableException(
        'Há análises em andamento. Tente novamente em instantes.',
      );
    this.active++;
    let directory: string | undefined;
    const controller = new AbortController();
    this.controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), CLONE_LIMITS.durationMs);
    try {
      let files: RepositoryFile[];
      try {
        await mkdir(this.storageRoot, { recursive: true, mode: 0o700 });
        directory = await mkdtemp(join(this.storageRoot, 'scan-'));
        const repository = join(directory, 'repository.git');
        // Bare: objetos Git sem checkout, filtros ou symlinks no disco.
        const clone = this.git(
          [
            'clone',
            '--bare',
            '--depth=1',
            '--single-branch',
            '--no-tags',
            '--template=',
            '--',
            `https://github.com/${owner}/${repo}.git`,
            repository,
          ],
          controller.signal,
        );
        let watching = false;
        let limitError: unknown;
        let pendingCheck: Promise<void> = Promise.resolve();
        const watcher = setInterval(() => {
          if (watching) return;
          watching = true;
          pendingCheck = this.directoryBytes(directory!)
            .then((bytes) => {
              if (bytes > CLONE_LIMITS.cloneBytes) {
                limitError = new PayloadTooLargeException(
                  'Repositório excede o limite de download.',
                );
                controller.abort();
              }
            })
            .catch((error: unknown) => {
              limitError = error;
              controller.abort();
            })
            .finally(() => {
              watching = false;
            });
        }, 250);
        try {
          await clone;
        } catch (error) {
          throw limitError ?? error;
        } finally {
          clearInterval(watcher);
          await pendingCheck;
        }
        if (limitError) throw limitError;
        if ((await this.directoryBytes(directory)) > CLONE_LIMITS.cloneBytes)
          throw new PayloadTooLargeException(
            'Repositório excede o limite de download.',
          );
        files = await this.readFiles(repository, controller.signal);
      } catch (error) {
        this.handleCollectionError(error);
      }
      // A pasta permanece até o motor concluir. Seus erros não são erros de coleta.
      return await consume(files);
    } finally {
      clearTimeout(timer);
      try {
        // Exclusivamente a pasta criada por mkdtemp nesta operação, nunca a raiz.
        if (directory) await this.cleanupDirectory(directory);
      } finally {
        this.controllers.delete(controller);
        this.active--;
      }
    }
  }

  private git(args: string[], signal: AbortSignal): Promise<string> {
    return runGit(args, signal);
  }

  private async cleanupDirectory(directory: string): Promise<void> {
    try {
      await rm(directory, { recursive: true, force: true, maxRetries: 3 });
    } catch {
      this.logger.error('Falha ao remover pasta temporária da análise.');
      throw new ServiceUnavailableException(
        'Não foi possível finalizar a limpeza da análise.',
      );
    }
  }

  private async directoryBytes(path: string): Promise<number> {
    let bytes = 0;
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      try {
        if (entry.isDirectory()) bytes += await this.directoryBytes(child);
        else if (entry.isFile()) bytes += (await lstat(child)).size;
      } catch (error) {
        if (!(
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ))
          throw error;
      }
      if (bytes > CLONE_LIMITS.cloneBytes) return bytes;
    }
    return bytes;
  }

  private async readFiles(
    repository: string,
    signal: AbortSignal,
  ): Promise<RepositoryFile[]> {
    const tree = await this.git(
      ['--git-dir', repository, 'ls-tree', '-r', '-z', '-l', 'HEAD'],
      signal,
    );
    const entries = tree.split('\0').filter(Boolean);
    if (entries.length > CLONE_LIMITS.entries)
      throw new PayloadTooLargeException('Repositório contém arquivos demais.');
    const files: RepositoryFile[] = [];
    let total = 0;
    for (const entry of entries) {
      const match = entry.match(
        /^(100644|100755) blob ([a-f\d]{40,64})\s+(\d+)\t([\s\S]+)$/,
      );
      // Symlinks e submódulos não são seguidos.
      if (!match || !this.isRelevantPath(match[4])) continue;
      total += Number(match[3]);
      if (
        Number(match[3]) > CLONE_LIMITS.fileBytes ||
        total > CLONE_LIMITS.contentBytes ||
        files.length >= CLONE_LIMITS.files
      ) {
        throw new PayloadTooLargeException(
          'Repositório excede os limites de arquivos da análise.',
        );
      }
      const content = await this.git(
        ['--git-dir', repository, 'cat-file', 'blob', match[2]],
        signal,
      );
      if (content.includes('\0'))
        throw new BadRequestException(
          'Arquivo relevante contém conteúdo binário não suportado.',
        );
      files.push({ path: match[4], content });
    }
    return files;
  }

  private isRelevantPath(path: string): boolean {
    const segments = path.toLowerCase().split('/');
    if (
      segments.some((segment) =>
        [
          'node_modules',
          'vendor',
          'dist',
          'build',
          'coverage',
          '.git',
        ].includes(segment),
      )
    )
      return false;
    const name = segments.at(-1) ?? '';
    if (/^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/i.test(name)) return false;
    return (
      name === 'readme' ||
      name.startsWith('readme.') ||
      name === 'dockerfile' ||
      /\.(html?|[cm]?[jt]sx?|md|json|ya?ml|css|scss)$/.test(name)
    );
  }

  private handleCollectionError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    this.logger.warn('Falha na coleta por clone temporário.');
    if (
      error instanceof Error &&
      /repository not found|could not read username|authentication failed/i.test(
        error.message,
      )
    ) {
      throw new NotFoundException(
        'Repositório público não encontrado ou sem acesso público.',
      );
    }
    throw new ServiceUnavailableException(
      'Não foi possível clonar o repositório dentro do tempo limite. Verifique sua conexão e tente novamente.',
    );
  }
}
