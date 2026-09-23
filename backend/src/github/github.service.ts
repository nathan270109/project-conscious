import { BadRequestException, Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

export interface RepositoryFile {
  path: string;
  content?: string;
}

interface RepositoryReference {
  owner: string;
  repo: string;
}

@Injectable()
export class GithubService {
  private readonly octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });

  parseRepositoryUrl(repositoryUrl: string): RepositoryReference {
    try {
      const url = new URL(repositoryUrl.trim());
      const parts = url.pathname
        .replace(/^\/|\/$/g, '')
        .replace(/\.git$/, '')
        .split('/');

      const isGithubUrl =
        url.protocol === 'https:' &&
        url.hostname === 'github.com' &&
        parts.length === 2 &&
        parts[0] &&
        parts[1];

      if (!isGithubUrl) {
        throw new Error('URL inválida');
      }

      return {
        owner: parts[0],
        repo: parts[1],
      };
    } catch {
      throw new BadRequestException(
        'Informe uma URL válida, como https://github.com/owner/repo',
      );
    }
  }

  async getRepositoryFiles(repositoryUrl: string): Promise<RepositoryFile[]> {
    const { owner, repo } = this.parseRepositoryUrl(repositoryUrl);

    // Busca dados do repositório para descobrir a branch padrão, como main ou master.
    const repository = await this.octokit.rest.repos.get({
      owner,
      repo,
    });

    // Busca somente a árvore de arquivos da branch padrão.
    const tree = await this.octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: repository.data.default_branch,
      recursive: '1',
    });

    const relevantFiles = tree.data.tree.filter(
      (entry) =>
        entry.type === 'blob' &&
        typeof entry.path === 'string' &&
        typeof entry.sha === 'string' &&
        this.isRelevantPath(entry.path),
    );

    // Faz download de conteúdo somente dos arquivos que interessam à análise.
    return Promise.all(
      relevantFiles.map(async (file) => ({
        path: file.path!,
        content: await this.getFileContent(owner, repo, file.sha!),
      })),
    );
  }

  private isRelevantPath(path: string): boolean {
    const normalizedPath = path.toLowerCase();

    const isReadme =
      normalizedPath === 'readme.md' ||
      normalizedPath.startsWith('readme.');

    const isHtmlTemplate = /\.html?$/.test(normalizedPath);
    const isTypeScriptOrJavaScript = /\.[jt]sx?$/.test(normalizedPath);

    return isReadme || isHtmlTemplate || isTypeScriptOrJavaScript;
  }

  private async getFileContent(
    owner: string,
    repo: string,
    fileSha: string,
  ): Promise<string> {
    const blob = await this.octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: fileSha,
    });

    return Buffer.from(blob.data.content, 'base64').toString('utf-8');
  }
}