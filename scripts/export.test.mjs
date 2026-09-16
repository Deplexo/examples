import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { exportTemplate } from './export.mjs';

test('exports one independent starter with license and provenance', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'deplexo-export-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = await exportTemplate('static-site', join(dir, 'site'));
  assert.match(await readFile(join(output, 'LICENSE'), 'utf8'), /MIT License/);
  assert.match(await readFile(join(output, 'index.html'), 'utf8'), /<!doctype html>/i);
  const provenance = JSON.parse(await readFile(join(output, '.deplexo-template.json')));
  assert.equal(provenance.template, 'static-site');
  assert.match(provenance.digest, /^[a-f0-9]{64}$/);
  await writeFile(join(output, 'keep.txt'), 'customer data');
  await assert.rejects(exportTemplate('static-site', output), { code: 'EEXIST' });
  assert.equal(await readFile(join(output, 'keep.txt'), 'utf8'), 'customer data');
});

test('rejects path traversal IDs', async () => {
  await assert.rejects(exportTemplate('../static-site', '/tmp/unused'), /Invalid template ID/);
});
