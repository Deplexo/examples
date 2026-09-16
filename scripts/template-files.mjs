import { readFile, readdir, lstat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ignored = new Set(['node_modules', '.next', 'out', '.venv', '__pycache__', '.pytest_cache', '.git', '.env', 'dist', 'coverage', '.coverage', 'htmlcov', 'bin', '.ruff_cache', '.mypy_cache']);

export async function readTemplateFiles(directory) {
  const files = [];
  async function walk(current) {
    for (const name of (await readdir(current)).sort()) {
      if (ignored.has(name) || (name.startsWith('.env.') && name !== '.env.example') || /\.(?:log|tsbuildinfo|pyc|test|prof)$/.test(name) || /^coverage\.(?:out|xml|json)$/.test(name)) continue;
      const path = join(current, name);
      const stat = await lstat(path);
      if (stat.isSymbolicLink()) throw new Error(`Symlinks are not allowed: ${path}`);
      if (stat.isDirectory()) { await walk(path); continue; }
      if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error(`Unsupported template file: ${path}`);
      const data = await readFile(path);
      if (data.includes(0)) throw new Error(`Use text assets in starters: ${path}`);
      files.push({ path: relative(directory, path).split('\\').join('/'), content: data.toString('utf8') });
    }
  }
  await walk(directory);
  if (files.length > 100) throw new Error('Templates are limited to 100 files');
  return files;
}
