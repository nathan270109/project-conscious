import {
  gitPlatformSettings,
  runGit,
  treeKillArguments,
} from './git-command.js';

describe('runGit', () => {
  it.each(['darwin', 'linux', 'win32'] as const)(
    'isola configurações e prompts no %s',
    (platform) => {
      const settings = gitPlatformSettings(platform, {
        PATH: 'safe-path',
        GIT_CONFIG_COUNT: '1',
        git_config_global: 'personal',
        SSH_ASKPASS: 'popup',
      });
      expect(settings.env.GIT_CONFIG_GLOBAL).toBe(
        platform === 'win32' ? 'NUL' : '/dev/null',
      );
      expect(settings.detached).toBe(platform !== 'win32');
      expect(settings.env.GIT_ASKPASS).toBe('');
      expect(settings.env.SSH_ASKPASS).toBe('');
      expect(settings.env).not.toHaveProperty('GIT_CONFIG_COUNT');
      expect(settings.env).not.toHaveProperty('git_config_global');
    },
  );
  it('Windows encerra apenas o PID criado e seus filhos, sem matar todos os processos Node', () => {
    expect(treeKillArguments(1234)).toEqual(['/PID', '1234', '/T', '/F']);
    expect(() => treeKillArguments(-1)).toThrow();
  });
  it('suprime cabeçalho de autenticação e desabilita o helper de credenciais', async () => {
    const signal = new AbortController().signal;
    expect(await runGit(['config', '--get', 'http.extraHeader'], signal)).toBe(
      'Authorization:\n',
    );
    expect(await runGit(['config', '--get', 'credential.helper'], signal)).toBe(
      '\n',
    );
  });
  it('executa Git instalado sem shell', async () => {
    expect(await runGit(['--version'], new AbortController().signal)).toMatch(
      /^git version /,
    );
  });
  it('rejeita operação já cancelada', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(runGit(['--version'], controller.signal)).rejects.toThrow(
      'aborted',
    );
  });
  it('bloqueia protocolo local antes de clonar qualquer dado', async () => {
    await expect(
      runGit(
        ['ls-remote', 'file:///nonexistent'],
        new AbortController().signal,
      ),
    ).rejects.toThrow('not allowed');
  });
});
