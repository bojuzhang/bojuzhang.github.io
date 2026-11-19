import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { build, output, root } from './build.mjs';

const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const port = Number(valueOf('--port', process.env.PORT || '4173'));
const host = valueOf('--host', '127.0.0.1');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.bib': 'text/plain; charset=utf-8' };

await build();
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const requestURL = new URL(request.url, `http://${host}:${port}`);
    const pathname = decodeURIComponent(requestURL.pathname);
    let target = path.resolve(output, `.${pathname}`);
    if (target !== output && !target.startsWith(`${output}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if ((await stat(target)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(302, { Location: `${requestURL.pathname}/${requestURL.search}` }).end();
        return;
      }
      target = path.join(target, 'index.html');
    }
    const file = await readFile(target);
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : file);
  } catch (error) {
    const status = error instanceof URIError ? 400 : 404;
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(status === 400 ? 'Bad request' : 'Page not found');
  }
});

server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`Local: http://${host}:${port}/\n${watchMode ? 'Watching templates/, data/ and assets/. Refresh the browser after changes.' : 'Previewing the static site.'}`));

const watchers = [];
if (watchMode) {
  let timer;
  let building = false;
  let queued = false;
  async function rebuild() {
    if (building) { queued = true; return; }
    building = true;
    try { await build(); } catch (error) { console.error(`Build failed: ${error.message}`); }
    finally {
      building = false;
      if (queued) { queued = false; void rebuild(); }
    }
  }
  for (const directory of ['templates', 'data', 'assets', 'assets/images', 'assets/files']) {
    watchers.push(watch(path.join(root, directory), () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 100);
    }));
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  for (const watcher of watchers) watcher.close();
  server.close(() => process.exit(0));
});
