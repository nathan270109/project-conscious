import { execFile, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { access, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { emitKeypressEvents } from 'node:readline';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const defaultAiTarget = 'http://127.0.0.1:3000';

export function parseAwsCredentialExport(stdout) {
  const credentials = {};
  for (const line of String(stdout).split('\n')) {
    const match = line.match(/^export (AWS_[A-Z_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2];
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    credentials[match[1]] = value;
  }
  return credentials;
}

export async function awsCredentialEnv() {
  const profile = process.env.AWS_PROFILE || 'default';
  const { stdout } = await execFileAsync(
    'aws',
    ['configure', 'export-credentials', '--profile', profile, '--format', 'env'],
    { timeout: 15_000 },
  );
  return parseAwsCredentialExport(stdout);
}

export function developmentProxyConfig(
  backendUrl,
  aiTarget = process.env.CONSCIOUS_AI_TARGET || defaultAiTarget,
) {
  return {
    '/api/ai/**': {
      target: aiTarget,
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '' },
    },
    '/api/**': {
      target: backendUrl,
      pathRewrite: { '^/api': '' },
    },
  };
}

export function supportedNode(version) {
  const [major, minor, patch] = version.replace(/^v/, '').split('.').map(Number);
  return (
    major >= 26 ||
    (major === 24 && minor >= 15) ||
    (major === 22 && (minor > 22 || (minor === 22 && patch >= 3)))
  );
}
export function windowsKillArgs(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error('PID inválido');
  return ['/PID', String(pid), '/T', '/F'];
}
export async function availablePort(start, host = '127.0.0.1') {
  for (let port = start; port < start + 50; port++) {
    const free = await new Promise((done) => {
      const server = createServer();
      server.once('error', (error) => {
        if (error.code === 'EADDRINUSE') done(false);
        else done(undefined);
      });
      server.listen(port, host, () => server.close(() => done(true)));
    });
    if (free) return port;
    if (free === undefined) throw new Error('Não foi possível verificar as portas locais.');
  }
  throw new Error(`Nenhuma porta livre entre ${start} e ${start + 49}.`);
}
async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function main(args = process.argv.slice(2)) {
  if (args.some((arg) => !['--check', '--smoke'].includes(arg)))
    throw new Error('Opções disponíveis: --check ou --smoke.');
  if (!supportedNode(process.version))
    throw new Error('Instale Node.js 24.15+ (LTS), 22.22.3+ ou 26+.');
  const npmCli = process.env.npm_execpath;
  if (!npmCli || !(await exists(npmCli)))
    throw new Error('Inicie pelo arquivo do seu sistema ou por npm run conscious:start.');
  const managed = new Set();
  let stopping = false;
  let stopPromise;
  let runtime;
  let raw = false;
  const color = (code, text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);

  const stopChild = async (child) => {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
    const closed = once(child, 'close').catch(() => {});
    if (child.connected) {
      try {
        child.send('conscious:shutdown');
      } catch {
        /* Usa encerramento por PID. */
      }
      await Promise.race([
        closed,
        new Promise((done) => {
          const timeout = setTimeout(done, 8000);
          timeout.unref();
        }),
      ]);
      if (child.exitCode !== null || child.signalCode !== null) return;
    }
    if (process.platform === 'win32') {
      await new Promise((done) => {
        const killer = spawn('taskkill.exe', windowsKillArgs(child.pid), {
          shell: false,
          windowsHide: true,
          stdio: 'ignore',
        });
        killer.once('error', () => {
          child.kill();
          done();
        });
        killer.once('close', () => {
          if (child.exitCode === null) child.kill();
          done();
        });
      });
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        /* Encerrado. */
      }
      const timer = setTimeout(() => {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          /* Encerrado. */
        }
      }, 5000);
      timer.unref();
      await closed;
      clearTimeout(timer);
      // Descendentes que sobrevivam ao pai recebem encerramento do mesmo grupo.
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        /* Grupo encerrado. */
      }
    }
    await closed;
  };
  const stop = () => {
    if (stopPromise) return stopPromise;
    stopping = true;
    stopPromise = (async () => {
      if (raw) process.stdin.setRawMode(false);
      process.stdin.pause();
      await Promise.all([...managed].map(stopChild));
      console.log(
        '\nServidores deste inicializador encerrados. Outros processos foram preservados.',
      );
    })();
    return stopPromise;
  };
  const signals = ['SIGINT', 'SIGTERM', ...(process.platform === 'win32' ? [] : ['SIGHUP'])];
  const signalHandler = () => {
    void stop();
  };
  for (const signal of signals) process.on(signal, signalHandler);

  const startChild = (label, executable, childArgs, cwd, extraEnv = {}, ipc = false) => {
    if (stopping) throw new Error('Inicialização cancelada.');
    const logPath = join(runtime, `${label}.log`);
    const log = createWriteStream(logPath);
    const child = spawn(executable, childArgs, {
      cwd,
      shell: false,
      detached: process.platform !== 'win32',
      windowsHide: true,
      env: { ...process.env, ...extraEnv },
      stdio: ipc ? ['ignore', 'pipe', 'pipe', 'ipc'] : ['ignore', 'pipe', 'pipe'],
    });
    managed.add(child);
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    child.once('close', () => log.end());
    child.once('error', (error) => {
      log.write(`\n${error.message}\n`);
    });
    return { child, logPath };
  };
  const runNpm = async (label, cwd, command) => {
    console.log(`  ${label}...`);
    const { child, logPath } = startChild(label, process.execPath, [npmCli, ...command], cwd);
    const [code] = await once(child, 'close');
    if (code !== 0 || stopping) throw new Error(`${label} não terminou. Consulte ${logPath}`);
  };
  const ready = async (service, url, check, timeoutMs) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && !stopping) {
      if (service.child.exitCode !== null || service.child.signalCode !== null)
        throw new Error(`Servidor encerrou antes de ficar pronto. Log: ${service.logPath}`);
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (response.ok && (await check(response))) return;
      } catch {
        /* Aguarda o servidor realmente responder. */
      }
      await new Promise((done) => setTimeout(done, 500));
    }
    throw new Error(`Servidor não ficou pronto no prazo. Log: ${service.logPath}`);
  };

  try {
    console.log(
      color(
        '36',
        '\n+--------------------------------------------------+\n|          PROJECT CONSCIOUS - INICIAR             |\n+--------------------------------------------------+',
      ),
    );
    const git = spawn('git', ['--version'], { shell: false, windowsHide: true, stdio: 'ignore' });
    const [gitCode] = await once(git, 'close');
    if (gitCode !== 0)
      throw new Error('Git não encontrado no PATH. Instale Git (Git for Windows no Windows).');
    const backend = join(root, 'backend');
    const frontInstalled = await exists(join(root, 'node_modules/@angular/cli/bin/ng.js'));
    const backInstalled = await exists(join(backend, 'node_modules/@nestjs/cli/bin/nest.js'));
    if (args.includes('--check')) {
      let credenciais = 'não';
      try {
        credenciais = (await awsCredentialEnv()).AWS_ACCESS_KEY_ID ? 'sim' : 'não';
      } catch {
        credenciais = 'não';
      }
      console.log(
        `  Node: ${process.version}\n  Git: disponível\n  npm: disponível\n  Frontend instalado: ${frontInstalled}\n  Backend instalado: ${backInstalled}\n  Credenciais AWS para o chat: ${credenciais}\n  Sistema: ${process.platform}\n\nVerificação concluída; nenhum servidor iniciado.`,
      );
      return;
    }
    await mkdir(join(root, '.conscious-runtime'), { recursive: true });
    runtime = await mkdtemp(join(root, '.conscious-runtime/session-'));
    console.log(`Logs desta sessão: ${runtime}`);
    if (!frontInstalled) await runNpm('instalar-frontend', root, ['ci']);
    if (!backInstalled) await runNpm('instalar-backend', backend, ['ci']);
    // Não usa dist antigo nem depende de watcher para a apresentação.
    await runNpm('build-backend', backend, ['run', 'build']);
    const backendPort = await availablePort(3000);
    const frontendPort = await availablePort(4200);
    const backendUrl = `http://127.0.0.1:${backendPort}`;
    const frontendOrigin = `http://127.0.0.1:${frontendPort}`;
    const proxy = join(runtime, 'proxy.json');
    await writeFile(
      proxy,
      JSON.stringify(developmentProxyConfig(backendUrl), null, 2),
    );
    // Credenciais AWS do operador para o chat: resolve do perfil local quando
    // o ambiente ainda não as traz. Falha aqui não impede o início; o chat
    // responderá 502 com mensagem segura e o operador pode refazer o login.
    let awsEnv = {};
    if (!process.env.AWS_ACCESS_KEY_ID) {
      try {
        awsEnv = await awsCredentialEnv();
        if (!awsEnv.AWS_ACCESS_KEY_ID) awsEnv = {};
      } catch {
        awsEnv = {};
      }
      console.log(
        awsEnv.AWS_ACCESS_KEY_ID
          ? 'Credenciais do Bedrock resolvidas do perfil AWS local.'
          : 'Sem credenciais AWS: o chat responderá 502 até refazer aws login.',
      );
    }
    const api = startChild(
      'backend',
      process.execPath,
      [join(backend, 'dist/main.js')],
      backend,
      { PORT: String(backendPort), HOST: '127.0.0.1', ...awsEnv },
      true,
    );
    await ready(
      api,
      `${backendUrl}/demo/analysis`,
      async (response) => (await response.json()).demoMode === true,
      60_000,
    );
    const front = startChild(
      'frontend',
      process.execPath,
      [
        join(root, 'node_modules/@angular/cli/bin/ng.js'),
        'serve',
        '--host',
        '127.0.0.1',
        '--port',
        String(frontendPort),
        '--proxy-config',
        proxy,
      ],
      root,
    );
    await ready(
      front,
      frontendOrigin,
      async (response) => (await response.text()).includes('<app-root'),
      120_000,
    );
    console.log(
      color(
        '32',
        '\n+--------------------------------------------------+\n|                  TUDO PRONTO!                    |\n+--------------------------------------------------+',
      ),
    );
    console.log(
      `\n  FRONTEND - abra no navegador\n  ${color('36', `${frontendOrigin}/projects/new`)}\n\n  BACKEND - API\n  ${color('33', backendUrl)}\n\n  Logs: ${runtime}\n  Encerrar: tecla Q ou Ctrl+C nesta janela.\n  Não feche a janela enquanto estiver apresentando.\n`,
    );
    if (args.includes('--smoke')) {
      const created = await fetch(`${frontendOrigin}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ensaio inicializador',
          repositoryUrl: 'https://github.com/katherinykamili/project-conscious-demo',
        }),
      });
      if (created.status !== 201)
        throw new Error(`Cadastro de ensaio falhou: HTTP ${created.status}`);
      const { id } = await created.json();
      const response = await fetch(`${frontendOrigin}/api/projects/${id}/analyze`, {
        method: 'POST',
        signal: AbortSignal.timeout(60_000),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'COMPLETED' || result.demoMode !== false)
        throw new Error('Análise real do ensaio falhou. Consulte os logs.');
      const leftovers = await import('node:fs/promises').then(({ readdir }) =>
        readdir(join(backend, '.analysis-tmp')),
      );
      if (leftovers.length)
        throw new Error(
          'Há pastas temporárias restantes. Verifique as análises em andamento antes de removê-las.',
        );
      console.log(`Ensaio aprovado: score ${result.score}, cinco dimensões e clone removido.`);
      return;
    }
    await new Promise((done) => {
      const finish = () => {
        void stop().then(done);
      };
      for (const service of [api, front])
        service.child.once('close', () => {
          if (!stopping) {
            process.exitCode = 1;
            console.error(`Servidor parou. Consulte ${service.logPath}`);
          }
          finish();
        });
      for (const signal of signals) process.once(signal, finish);
      if (process.stdin.isTTY) {
        emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        raw = true;
        process.stdin.resume();
        process.stdin.on('keypress', (_text, key) => {
          if (key?.name === 'q' || (key?.ctrl && key.name === 'c')) finish();
        });
      }
    });
  } finally {
    if (runtime) await stop();
    for (const signal of signals) process.removeListener(signal, signalHandler);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`\nERRO: ${error.message}\nVeja docs/inicializacao.md.`);
    process.exitCode = 1;
  });
}
