/** Mesma política de cadastro descrita em docs/api-contract.md; a API é a autoridade final. */
export function isGithubRepositoryUrl(value: string): boolean {
  const input = value.trim();
  if (input.length > 2048) return false;
  const match = input.match(/^https:\/\/github\.com\/([a-z\d](?:[a-z\d-]{0,37}[a-z\d])?)\/([a-z\d._-]+)\/?$/i);
  if (!match) return false;
  const repo = match[2].replace(/\.git$/i, '');
  return !!repo && repo !== '.' && repo !== '..' && repo.length <= 100;
}
