import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readTemplateFiles } from './template-files.mjs';

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'deplexo-source-files-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('omits secrets and build artifacts while retaining source and env examples', async t => {
  const directory = await fixture(t);
  for (const name of ['.env', '.env.local', '.env.example', 'main.go', 'coverage.out', 'app.test', 'tsconfig.tsbuildinfo']) {
    await writeFile(join(directory, name), 'fixture');
  }
  await mkdir(join(directory, 'bin'));
  await writeFile(join(directory, 'bin', 'app'), Buffer.from([0x7f, 69, 76, 70, 0]));
  assert.deepEqual((await readTemplateFiles(directory)).map(file => file.path), ['.env.example', 'main.go']);
});

test('rejects unrecognized binaries and symlinks instead of exporting them', async t => {
  const directory = await fixture(t);
  const binary = join(directory, 'local-app');
  await writeFile(binary, Buffer.from([0x7f, 69, 76, 70, 0]));
  await assert.rejects(readTemplateFiles(directory), /Use text assets/);
  await rm(binary);
  await symlink('/etc/hostname', join(directory, 'external'));
  await assert.rejects(readTemplateFiles(directory), /Symlinks are not allowed/);
});
