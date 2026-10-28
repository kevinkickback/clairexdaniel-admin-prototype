import http from 'node:http';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const libraryRoot = fileURLToPath(new URL('./dist/', import.meta.url));
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'none'; object-src 'none'; base-uri 'self'";
const liveClients = new Set();
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  if (req.url === '/__dev_events' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write(': preview connected\n\n'); liveClients.add(res);
    req.on('close', () => liveClients.delete(res)); return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end('This prototype has no server-side write endpoints.'); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/library') { res.writeHead(302, { Location:'/library/' }); res.end(); return; }
    const isLibrary = pathname.startsWith('/library/');
    const selectedRoot = isLibrary ? libraryRoot : root;
    const relativePath = isLibrary ? pathname.slice('/library'.length) : pathname;
    const file = resolve(selectedRoot, '.' + relativePath + (relativePath.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(selectedRoot.endsWith(sep) ? selectedRoot : selectedRoot + sep)) { res.writeHead(403); res.end(); return; }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, host, () => console.log(`Restaurant admin prototype\nLocal: http://${host}:${port}\nMock data only. Browser edits are saved on this device.\nPress Ctrl+C to stop.`));
server.on('error', err => { console.error(err.message); process.exitCode = 1; });
let reloadTimer;
const watcher = watch(root, { recursive: true }, () => {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => { for (const client of liveClients) client.write('event: reload\ndata: updated\n\n'); }, 200);
});
const keepAlive = setInterval(() => { for (const client of liveClients) client.write(': keep-alive\n\n'); }, 20000);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { watcher.close(); clearInterval(keepAlive); for (const client of liveClients) client.end(); server.close(); });
