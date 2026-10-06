import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const type = process.argv[2] as 'patch' | 'minor' | 'major';

if (!type || !['patch', 'minor', 'major'].includes(type)) {
  console.error('[version] Usage: bun run scripts/version.ts <patch|minor|major>');
  process.exit(1);
}

const pkgPath = resolve(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const oldVersion: string = pkg.version || '0.0.1';

const parts = oldVersion.split('.').map(Number);
if (parts.length !== 3 || parts.some(isNaN)) {
  console.error(`[version] Invalid semver in package.json: ${oldVersion}`);
  process.exit(1);
}

let [major, minor, patch] = parts;
if (type === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (type === 'minor') {
  minor += 1;
  patch = 0;
} else if (type === 'patch') {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

console.log(`[version] Bumped package.json: ${oldVersion} -> ${newVersion}`);
console.log(`[version] Canonical Git release tag will be: v${newVersion}`);
console.log(`[version] Floating major tag will be: v${major}`);
