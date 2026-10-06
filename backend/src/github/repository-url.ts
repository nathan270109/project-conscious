export const MAX_REPOSITORY_URL_LENGTH = 2048;

/** Política de entrada: URL HTTPS direta, sem credenciais, porta ou sufixos de navegação. */
export function parseGithubRepositoryUrl(value: unknown): { owner: string; repo: string } | undefined {
  if (typeof value !== 'string') return undefined;
  const input = value.trim();
  if (input.length > MAX_REPOSITORY_URL_LENGTH) return undefined;
  // Verifica o texto original para não aceitar segmentos que URL normaliza (.., %xx, porta 443).
  const match = input.match(/^https:\/\/github\.com\/([a-z\d](?:[a-z\d-]{0,37}[a-z\d])?)\/([a-z\d._-]+)\/?$/i);
  if (!match) return undefined;
  const repo = match[2].replace(/\.git$/i, '');
  if (!repo || repo === '.' || repo === '..' || repo.length > 100) return undefined;
  return { owner: match[1], repo };
}
