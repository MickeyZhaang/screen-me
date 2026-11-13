import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const port = Number(process.env.SCREEN_ME_SMOKE_PORT ?? 9234);
const architecture = process.arch === 'arm64' ? 'arm64' : 'x64';
const executable = join(
  process.cwd(),
  'out',
  `Screen Me-darwin-${architecture}`,
  'Screen Me.app',
  'Contents',
  'MacOS',
  'Screen Me',
);
const userData = await mkdtemp(join(tmpdir(), 'screen-me-package-smoke-'));
const app = spawn(executable, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userData}`,
]);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const getTarget = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json`).then(
        (response) => response.json(),
      );
      const target = targets.find(
        (candidate) =>
          candidate.type === 'page' &&
          candidate.url === 'screen-me://app/index.html',
      );
      if (target?.webSocketDebuggerUrl) {
        return target;
      }
    } catch {}
    await delay(50);
  }
  throw new Error('The packaged app did not expose a debugger target');
};

const evaluate = async (webSocketDebuggerUrl) =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketDebuggerUrl);
    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression:
              'window.screenMe.home ? Promise.all([window.screenMe.home.getStatus(), window.screenMe.home.listCaptures()]).then(() => true) : false',
            awaitPromise: true,
            returnByValue: true,
          },
        }),
      );
    });
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) {
        return;
      }
      socket.close();
      if (
        message.result.exceptionDetails ||
        message.result.result.value !== true
      ) {
        reject(
          new Error(
            `The packaged app could not read its database: ${JSON.stringify(message.result)}`,
          ),
        );
        return;
      }
      resolve();
    });
    socket.addEventListener('error', reject);
  });

try {
  const target = await getTarget();
  await delay(500);
  await evaluate(target.webSocketDebuggerUrl);
} finally {
  app.kill();
  await rm(userData, { recursive: true, force: true });
}
