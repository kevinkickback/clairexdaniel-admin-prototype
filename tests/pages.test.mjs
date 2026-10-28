import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, mkdir, readFile, writeFile, readdir, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildSite } from '../scripts/build-pages.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const prototype = { id:'baseline', title:'Service & seating', description:'Try the daily workflows.', label:'Baseline', ref:'working-tree', screenshot:'artifacts/dashboard-desktop.jpg', files:['shell.js','calm.css','images/dining-room.png','images/seasonal-menu.png'] };
async function fixture(t, prototypes = [prototype]) {
  const root = await mkdtemp(join(tmpdir(), 'dxc-pages-test-'));
  t.after(async () => {
    const resolved = await realpath(root);
    const parent = await realpath(tmpdir());
    if (dirname(resolved) !== parent || !resolved.startsWith(join(parent, 'dxc-pages-test-'))) throw new Error('Unexpected test cleanup path.');
    await rm(resolved, { recursive:true, force:true });
  });
  for (const folder of ['public', 'gallery', 'artifacts']) await cp(join(project, folder), join(root, folder), { recursive:true });
  await writeFile(join(root, 'prototypes.json'), JSON.stringify({ prototypes }));
  return root;
}

test('Pages output contains only allowlisted browser assets with portable project-subpath URLs', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'public/private-notes.txt'), 'Not for publishing');
  const result = await buildSite(root);
  const files = (await readdir(result.directory, { recursive:true })).map(path => path.replaceAll('\\', '/'));
  assert.equal(result.files, 16);
  assert.ok(files.includes('.nojekyll'));
  assert.ok(!files.some(path => /private-notes|dev-reload|server\.mjs|admin-review|\.git/.test(path)));
  const html = await readFile(join(result.directory, 'prototypes/baseline/index.html'), 'utf8');
  assert.match(html, /Content-Security-Policy/);
  assert.doesNotMatch(html, /dev-reload|__dev_events/);
  const address = new URL('https://example.test/repository/prototypes/baseline/');
  for (const [, asset] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (asset.startsWith('data:')) continue;
    const url = new URL(asset, address);
    assert.ok(url.pathname.startsWith('/repository/prototypes/baseline/'));
    assert.ok(files.includes(url.pathname.slice('/repository/'.length)));
  }
  const gallery = await readFile(join(result.directory, 'index.html'), 'utf8');
  assert.match(gallery, /Service &amp; seating/);
  assert.match(gallery, /href="\.\/prototypes\/baseline\/"/);
  assert.match(await readFile(join(result.directory, 'prototypes/baseline/shell.js'), 'utf8'), /href="\.\.\/\.\.\/"/);
  assert.ok(files.includes('prototypes/baseline/images/dining-room.png'));
});

test('Variants have separate stable browser storage and escaped gallery content', async t => {
  const root = await fixture(t, [prototype, { ...prototype, id:'alternative', title:'<Design "B">' }]);
  await buildSite(root);
  for (const id of ['baseline', 'alternative']) {
    const data = await readFile(join(root, 'dist/prototypes', id, 'mock-data.js'), 'utf8');
    assert.match(data, new RegExp(`STORAGE_KEY = 'dxc-pages-${id}'`));
  }
  assert.equal(await readFile(join(root, 'public/mock-data.js'), 'utf8'), await readFile(join(project, 'public/mock-data.js'), 'utf8'));
  assert.match(await readFile(join(root, 'dist/index.html'), 'utf8'), /&lt;Design &quot;B&quot;&gt;/);
});

test('A pinned Git revision preserves its files when the working design changes', async t => {
  const root = await fixture(t);
  const git = args => execFileSync('git', args, { cwd:root, encoding:'utf8', windowsHide:true, stdio:['ignore', 'pipe', 'pipe'] });
  git(['init']);
  git(['add', 'public', 'artifacts']);
  git(['-c', 'user.name=Prototype test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'Baseline fixture']);
  const revision = git(['rev-parse', 'HEAD']).trim();
  await writeFile(join(root, 'public/styles.css'), '/* alternative design */');
  await writeFile(join(root, 'prototypes.json'), JSON.stringify({ prototypes:[{ ...prototype, ref:revision }, { ...prototype, id:'alternative' }] }));
  await buildSite(root);
  assert.doesNotMatch(await readFile(join(root, 'dist/prototypes/baseline/styles.css'), 'utf8'), /alternative design/);
  assert.equal(await readFile(join(root, 'dist/prototypes/alternative/styles.css'), 'utf8'), '/* alternative design */');
});

test('Invalid manifests fail before replacing an existing build', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'dist'));
  await writeFile(join(root, 'dist/keep.txt'), 'Previous valid output');
  for (const entries of [[{ ...prototype, id:'../escape' }], [prototype, prototype], [{ ...prototype, screenshot:'artifacts/../private.png' }], [{ ...prototype, ref:'--help' }], [{ ...prototype, files:['../admin-review.json'] }], [{ ...prototype, files:['dev-reload.js'] }]]) {
    await writeFile(join(root, 'prototypes.json'), JSON.stringify({ prototypes:entries }));
    await assert.rejects(buildSite(root), /Invalid|duplicate/);
    assert.equal(await readFile(join(root, 'dist/keep.txt'), 'utf8'), 'Previous valid output');
  }
});

test('An incompatible prototype fails visibly rather than sharing another design’s storage', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'public/mock-data.js'), 'export const data = {};');
  await assert.rejects(buildSite(root), /Expected one STORAGE_KEY declaration/);
});
