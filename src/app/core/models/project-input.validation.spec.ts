import { isGithubRepositoryUrl } from './project-input.validation';

describe('URL de cadastro — política do contrato', () => {
  it.each(['https://github.com/octocat/Hello-World', 'https://github.com/octocat/Hello-World.git/'])('aceita %s', url => {
    expect(isGithubRepositoryUrl(url)).toBe(true);
  });
  it.each(['https://example.com/a/b', 'https://github.com:443/a/b', 'https://user:secret@github.com/a/b',
    'https://github.com/a/b?', 'https://github.com/a/b#', 'https://github.com/a/../b',
    'https://github.com/a/%62', 'https://github.com/a/.git', 'https://github.com/a/b/tree/main'])('recusa %s', url => {
    expect(isGithubRepositoryUrl(url)).toBe(false);
  });
});
