import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readTemplateFiles } from './template-files.mjs';

export async function exportTemplate(id, destination) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Invalid template ID');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const directory = join(root, 'templates', id);
  await access(join(directory, 'template.json'));
  const files = await readTemplateFiles(directory);
  const target = resolve(destination);
  await mkdir(dirname(target), { recursive: true });
  // Reserve the final path first so an existing project can never be overwritten.
  await mkdir(target);
  try {
    for (const file of files) {
      const path = join(target, file.path);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, file.content, { flag: 'wx' });
    }
    const digest = createHash('sha256').update(JSON.stringify(files)).digest('hex');
    await writeFile(join(target, '.deplexo-template.json'), JSON.stringify({ template: id, source: 'https://github.com/Deplexo/examples', digest }, null, 2) + '\n', { flag: 'wx' });
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    throw error;
  }
  return target;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , id, destination] = process.argv;
  if (!id || !destination) throw new Error('Usage: node scripts/export.mjs TEMPLATE_ID NEW_DIRECTORY');
  console.log(`Exported ${id} to ${await exportTemplate(id, destination)}`);
}
