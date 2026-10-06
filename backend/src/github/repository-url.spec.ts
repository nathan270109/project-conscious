import { parseGithubRepositoryUrl } from './repository-url.js';

describe('Política de URL GitHub', () => {
  it.each(['https://github.com/octocat/Hello-World', 'https://github.com/octocat/Hello-World/',
    ' https://github.com/octocat/Hello-World.git/ '])('aceita repositório direto: %s', input => {
    expect(parseGithubRepositoryUrl(input)).toEqual({ owner: 'octocat', repo: 'Hello-World' });
  });
  it.each(['http://github.com/a/b', 'https://github.com.evil.test/a/b', 'https://github.com/a',
    'https://github.com/a/b/issues', 'https://github.com/a/b?', 'https://github.com/a/b#',
    'https://github.com:443/a/b', 'https://github.com/a/%62', 'https://github.com/a/..',
    'https://github.com/a/.git', 'https://github.com//a/b', 'https://github.com/a/b\\c',
    null, {}, 5])('recusa formatos fora do contrato: %j', input => {
    expect(parseGithubRepositoryUrl(input)).toBeUndefined();
  });
});
