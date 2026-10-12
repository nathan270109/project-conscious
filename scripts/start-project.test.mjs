import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { supportedNode, windowsKillArgs, availablePort } from './start-project.mjs';

test('valida versões mínimas do Angular sem aceitar versões incompatíveis', () => {
  for (const version of ['v22.22.3', 'v24.15.0', 'v26.0.0'])
    assert.equal(supportedNode(version), true);
  for (const version of ['v20.19.0', 'v22.22.2', 'v24.14.0', 'v25.9.0'])
    assert.equal(supportedNode(version), false);
});
test('taskkill usa apenas PID próprio e filhos, nunca /IM node.exe', () => {
  assert.deepEqual(windowsKillArgs(1234), ['/PID', '1234', '/T', '/F']);
  for (const pid of [0, -1, NaN, '1234 & bad']) assert.throws(() => windowsKillArgs(pid));
});
test('porta ocupada é preservada e o inicializador escolhe outra', async () => {
  const server = createServer();
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  try {
    const port = server.address().port;
    assert.ok((await availablePort(port)) > port);
    assert.equal(server.listening, true);
  } finally {
    await new Promise((done) => server.close(done));
  }
});
