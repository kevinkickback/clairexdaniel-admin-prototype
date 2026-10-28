import { readFile, writeFile, mkdir, rm, realpath, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const browserFiles = ['index.html', 'styles.css', 'app.js', 'views.js', 'ui.js', 'mock-data.js', 'domain.js', 'exports.js'];
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'none'; object-src 'none'; base-uri 'self'";

// Build only browser assets. Repository notes, credentials, and dev tools never enter dist.
export async function buildSite(root = projectRoot) {
  root = await realpath(root);
  const manifest = JSON.parse(await readFile(join(root, 'prototypes.json'), 'utf8'));
  if (!Array.isArray(manifest.prototypes) || !manifest.prototypes.length) throw new Error('Add at least one prototype to prototypes.json.');
  const ids = new Set();
  const output = new Map();
  const entries = [];

  for (const prototype of manifest.prototypes) {
    const { id, title, description, label, ref, screenshot } = prototype;
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{0,47}$/.test(id) || ids.has(id)) throw new Error(`Invalid or duplicate prototype id: ${id}`);
    ids.add(id);
    const extraFiles = prototype.files ?? [];
    if (!Array.isArray(extraFiles) || extraFiles.some(path => typeof path !== 'string' || !/^(?:shell\.js|calm\.css|studio\.css|images\/[a-z0-9-]+\.(?:jpg|png|webp))$/.test(path))) throw new Error(`Invalid additional browser asset for ${id}.`);
    if (prototype.legacyLibraryLink !== undefined && typeof prototype.legacyLibraryLink !== 'boolean') throw new Error(`Invalid legacy library option for ${id}.`);
    for (const [name, value] of Object.entries({ title, description, label, ref, screenshot })) {
      if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${name} for ${id}.`);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref)) throw new Error(`Invalid Git ref for ${id}.`);
    if (!/^artifacts\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(screenshot)) throw new Error(`Invalid screenshot path for ${id}.`);
    // Resolve refs to immutable commits. execFile has no shell interpolation.
    const revision = ref === 'working-tree' ? null : execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { cwd:root, encoding:'utf8', windowsHide:true }).trim();
    const source = path => revision
      ? Promise.resolve(execFileSync('git', ['show', `${revision}:${path}`], { cwd:root, maxBuffer:8 * 1024 * 1024, windowsHide:true }))
      : readFile(join(root, path));

    for (const name of new Set([...browserFiles,...extraFiles])) {
      let body = await source(`public/${name}`);
      if (name === 'index.html') {
        body = body.toString('utf8')
          .replace(/\s*<script\b[^>]*src=["'][^"']*dev-reload\.js["'][^>]*><\/script>/g, '')
          .replace(/(href|src)=["']\/(styles\.css|app\.js)["']/g, '$1="./$2"')
          .replace('<head>', `<head>\n  <meta http-equiv="Content-Security-Policy" content="${csp}">`);
      }
      if (name === 'mock-data.js') {
        body = body.toString('utf8');
        const declaration = /export const STORAGE_KEY = ['"][^'"]+['"];?/g;
        if ([...body.matchAll(declaration)].length !== 1) throw new Error(`Expected one STORAGE_KEY declaration in ${id}.`);
        // Stable per-design storage; refreshing a deployment preserves that design's edits.
        body = body.replace(declaration, `export const STORAGE_KEY = 'dxc-pages-${id}';`);
      }
      if (name === 'shell.js') body = body.toString('utf8').replace('href="/library/"', 'href="../../"');
      if (prototype.legacyLibraryLink && name === 'app.js') {
        const marker = '<div class="topbar-actions">';
        body = body.toString('utf8');
        if (body.split(marker).length !== 2) throw new Error(`Expected one legacy header in ${id}.`);
        body = body.replace(marker, marker + '<a class="prototype-library-link" href="../../" aria-label="Prototype library">${icon(\'grid\')}<span class="prototype-library-text">Prototype library</span></a>');
      }
      if (prototype.legacyLibraryLink && name === 'styles.css') body = body.toString('utf8') + '\n.prototype-library-link{display:inline-flex;align-items:center;gap:7px;min-height:38px;white-space:nowrap;text-decoration:none;font-size:12px;color:var(--forest)}.prototype-library-link .icon{width:16px;height:16px}.prototype-library-link:hover{text-decoration:underline}@media(max-width:760px){.prototype-library-text,.topbar .demo-label{display:none}.prototype-library-link{min-width:34px;justify-content:center}}\n';
      output.set(`prototypes/${id}/${name}`, body);
    }
    const extension = screenshot.slice(screenshot.lastIndexOf('.'));
    // Gallery snapshots belong to this manifest; app code remains pinned to its chosen ref.
    output.set(`assets/${id}${extension}`, await readFile(join(root, screenshot)));
    const href = `./prototypes/${id}/`;
    entries.push(`<article class="prototype" aria-labelledby="title-${id}">
      <a class="image-link" href="${href}" target="_blank" rel="noopener" aria-label="Open ${escape(title)} prototype (opens in a new tab)"><img src="./assets/${id}${extension}" alt="${escape(title)} dashboard preview" width="1265" height="712"></a>
      <div><p class="eyebrow">${escape(label)}</p><h2 id="title-${id}">${escape(title)}</h2><p class="description">${escape(description)}</p><a class="open" href="${href}" target="_blank" rel="noopener" aria-label="Open ${escape(title)} prototype (opens in a new tab)">Open prototype <span aria-hidden="true">↗</span></a><p class="new-tab">Opens in a new tab</p></div>
    </article>`);
  }

  const template = await readFile(join(root, 'gallery/index.html'), 'utf8');
  if (!template.includes('{{PROTOTYPES}}')) throw new Error('Gallery template is missing its prototype list.');
  output.set('index.html', template.replace('{{PROTOTYPES}}', entries.join('\n')));
  output.set('gallery.css', await readFile(join(root, 'gallery/gallery.css')));
  output.set('.nojekyll', '');

  // Only this project's fixed dist directory may be replaced. Refuse symlink targets.
  const dist = resolve(root, 'dist');
  if (dirname(dist) !== root) throw new Error('Build directory must stay inside the project.');
  const existing = await lstat(dist).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing?.isSymbolicLink() || (existing && !existing.isDirectory())) throw new Error('dist must be a regular directory.');
  if (existing && await realpath(dist) !== dist) throw new Error('Refusing to replace a redirected build directory.');
  await rm(dist, { recursive:true, force:true });
  for (const [path, body] of output) {
    const target = join(dist, path);
    await mkdir(dirname(target), { recursive:true });
    await writeFile(target, body);
  }
  return { directory:dist, prototypes:[...ids], files:output.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await buildSite();
  console.log(`Prepared ${result.prototypes.length} prototype(s), ${result.files} files in ${result.directory}.\nLocal build only. Nothing has been published.`);
}
