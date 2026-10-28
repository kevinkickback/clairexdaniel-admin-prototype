import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Use the same project subpath as Pages so local QA catches absolute-URL mistakes.
const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
const base = '/clairexdaniel-admin-prototype/';
const port = Number(process.env.PAGES_PREVIEW_PORT || 5174);
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/') { res.writeHead(302, { Location:base }); res.end(); return; }
    if (!pathname.startsWith(base)) throw new Error('Unknown project');
    let path = pathname.slice(base.length);
    if (!path || path.endsWith('/')) path += 'index.html';
    const target = await realpath(resolve(root, path));
    if (!target.startsWith(root + sep)) throw new Error('Outside build');
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type':types[extname(target)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Pages rehearsal (local only): http://127.0.0.1:${port}${base}\nNothing is published to GitHub Pages.`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
