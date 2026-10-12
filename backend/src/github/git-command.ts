import { spawn } from 'node:child_process';

export function gitPlatformSettings(
  platform: NodeJS.Platform,
  source: NodeJS.ProcessEnv,
) {
  const nullDevice = platform === 'win32' ? 'NUL' : '/dev/null';
  const env = Object.fromEntries(
    Object.entries(source).filter(
      ([key]) =>
        !key.toUpperCase().startsWith('GIT_') &&
        key.toUpperCase() !== 'SSH_ASKPASS',
    ),
  );
  return {
    nullDevice,
    detached: platform !== 'win32',
    env: {
      ...env,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: nullDevice,
      GIT_TERMINAL_PROMPT: '0',
      GIT_ASKPASS: '',
      SSH_ASKPASS: '',
      GIT_LFS_SKIP_SMUDGE: '1',
    },
  };
}

export function treeKillArguments(pid: number): string[] {
  if (!Number.isSafeInteger(pid) || pid <= 0)
    throw new Error('Invalid child PID');
  return ['/PID', String(pid), '/T', '/F'];
}

/** Sem shell ou credenciais/configurações Git do usuário. */
export function runGit(args: string[], signal: AbortSignal): Promise<string> {
  const settings = gitPlatformSettings(process.platform, process.env);
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error('Git operation aborted'));
    const child = spawn(
      'git',
      [
        '-c',
        'credential.helper=',
        '-c',
        'http.extraHeader=Authorization:',
        '-c',
        'http.cookieFile=',
        '-c',
        `core.hooksPath=${settings.nullDevice}`,
        '-c',
        'core.askPass=',
        '-c',
        'protocol.allow=never',
        '-c',
        'protocol.https.allow=always',
        '-c',
        'http.followRedirects=false',
        '-c',
        'http.lowSpeedLimit=1024',
        '-c',
        'http.lowSpeedTime=15',
        ...args,
      ],
      {
        shell: false,
        detached: settings.detached,
        windowsHide: true,
        env: settings.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    const output: Buffer[] = [];
    const errors: Buffer[] = [];
    let bytes = 0;
    let failure: Error | undefined;
    let stopping: Promise<void> | undefined;
    const stop = () => {
      failure ??= new Error('Git operation aborted');
      try {
        if (process.platform !== 'win32' && child.pid)
          process.kill(-child.pid, 'SIGKILL');
        else if (child.pid && !stopping) {
          stopping = new Promise<void>((done) => {
            const killer = spawn(
              'taskkill.exe',
              treeKillArguments(child.pid!),
              { shell: false, windowsHide: true, stdio: 'ignore' },
            );
            killer.once('error', () => {
              child.kill('SIGKILL');
              done();
            });
            killer.once('close', () => {
              if (child.exitCode === null) child.kill('SIGKILL');
              done();
            });
          });
        }
      } catch {
        /* O processo pode já ter terminado. */
      }
    };
    signal.addEventListener('abort', stop, { once: true });
    if (signal.aborted) stop();
    const capture = (chunks: Buffer[]) => (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > 4 * 1024 * 1024) {
        failure = new Error('Git output limit exceeded');
        stop();
      } else chunks.push(chunk);
    };
    child.stdout.on('data', capture(output));
    child.stderr.on('data', capture(errors));
    child.on('error', (error) => {
      signal.removeEventListener('abort', stop);
      reject(error);
    });
    // Aguarda os canais fecharem antes de permitir a limpeza da pasta.
    child.on('close', async (code) => {
      signal.removeEventListener('abort', stop);
      await stopping;
      if (failure) reject(failure);
      else if (code !== 0)
        reject(new Error(Buffer.concat(errors).toString('utf8')));
      else resolve(Buffer.concat(output).toString('utf8'));
    });
  });
}
