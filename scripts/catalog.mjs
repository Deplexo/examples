import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import Ajv from 'ajv';
import { readTemplateFiles } from './template-files.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = ['README.md', 'LICENSE', 'Dockerfile', 'deplexo.yaml', '.env.example', '.dockerignore', '.gitignore'];
const sha256 = data => createHash('sha256').update(data).digest('hex');

export async function buildCatalog() {
  const schema = JSON.parse(await readFile(join(root, 'schemas/template.schema.json'), 'utf8'));
  const validate = new Ajv({ allErrors: true }).compile(schema);
  const templates = [];
  const bundles = {};
  for (const id of (await readdir(join(root, 'templates'))).sort()) {
    const directory = join(root, 'templates', id);
    const meta = JSON.parse(await readFile(join(directory, 'template.json'), 'utf8'));
    if (!validate(meta)) throw new Error(`${id}: ${JSON.stringify(validate.errors)}`);
    if (meta.id !== id) throw new Error(`${id}: folder and template ID must match`);
    const keys = new Set();
    for (const input of meta.env) {
      if (keys.has(input.key)) throw new Error(`${id}: duplicate input ${input.key}`);
      keys.add(input.key);
      if (input.secret && input.default) throw new Error(`${id}: secret defaults are forbidden`);
    }
    const files = await readTemplateFiles(directory);
    const names = new Set(files.map(f => f.path));
    for (const name of required) if (!names.has(name)) throw new Error(`${id}: missing ${name}`);
    const config = files.find(f => f.path === 'deplexo.yaml').content;
    if (!config.includes('framework: dockerfile\n')) throw new Error(`${id}: explicit Dockerfile required`);
    if (meta.language === 'Go' && (!names.has('go.mod') || !names.has('go.sum'))) throw new Error(`${id}: Go module files required`);
    if (['TypeScript', 'JavaScript'].includes(meta.language) && !names.has('package-lock.json')) throw new Error(`${id}: npm lockfile required`);
    const digest = sha256(JSON.stringify(files));
    bundles[id] = { digest, files };
    templates.push(meta);
  }
  const revision = sha256(JSON.stringify(bundles));
  const source = { repository: 'https://github.com/Deplexo/examples', revision };
  return { catalog: { schemaVersion: 1, source, templates }, bundles: { schemaVersion: 1, source, templates: bundles } };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = await buildCatalog();
  for (const [name, value] of Object.entries(data)) {
    const output = JSON.stringify(value, null, 2) + '\n';
    const path = join(root, `${name}.json`);
    if (process.argv.includes('--check')) {
      if (await readFile(path, 'utf8') !== output) throw new Error(`${name}.json is stale; run npm run catalog`);
    } else await writeFile(path, output);
  }
  console.log(`Validated ${data.catalog.templates.length} templates`);
}
