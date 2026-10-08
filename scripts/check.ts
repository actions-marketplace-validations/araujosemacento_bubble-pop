import { readFileSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[check] FAILED: ${message}`);
    process.exit(1);
  }
}

// 1. Check for non-ASCII characters / emojis in text and source files
const filesToCheckForEmojis = [
  'README.md',
  'AGENTS.md',
  'CHANGELOG.md',
  'action.yml',
  'package.json',
  'src/index.ts',
  'src/api.ts',
  'src/svg.ts',
  'src/local.ts',
  'src/types.ts',
  'web/index.html',
  'web/src/style.css',
  'web/src/main.ts',
  'web/src/adapter.ts',
  'web/src/store.ts',
  'web/src/controls.ts',
  'web/src/canvas.ts',
  'web/src/exporter.ts',
  'web/src/types.ts',
  'web/src/theme.ts',
  'web/vite.config.ts',
  '.github/workflows/pages.yml',
  'docs/web-preview-plan.md',
];

console.log('[check] Verifying no emojis or prohibited dashes across project files...');
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const PROHIBITED_DASH_REGEX = /[—–]/;

for (const relPath of filesToCheckForEmojis) {
  const absPath = resolve(ROOT, relPath);
  if (!existsSync(absPath)) continue;

  const content = readFileSync(absPath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const emojiMatch = line.match(EMOJI_REGEX);
    if (emojiMatch) {
      assert(false, `Emoji "${emojiMatch[0]}" detected in ${relPath} line ${i + 1}: ${line.trim()}`);
    }
    const dashMatch = line.match(PROHIBITED_DASH_REGEX);
    if (dashMatch) {
      assert(false, `Prohibited dash "${dashMatch[0]}" detected in ${relPath} line ${i + 1}. Use standard ASCII hyphens (-).`);
    }
  }
}
console.log('  -> Emoji and dash check passed: clean plain-text standard maintained.');

// 2. Check action.yml configuration
console.log('[check] Verifying action.yml schema...');
const actionYml = readFileSync(resolve(ROOT, 'action.yml'), 'utf-8');
assert(actionYml.includes('using: "node20"') || actionYml.includes("using: 'node20'"), 'action.yml must use node20 runtime');
assert(actionYml.includes('dist/index.js'), 'action.yml must point main to dist/index.js');
console.log('  -> action.yml verified.');

// 3. Check dist/index.js bundle size
console.log('[check] Verifying bundle dist/index.js...');
const distPath = resolve(ROOT, 'dist/index.js');
assert(existsSync(distPath), 'dist/index.js does not exist. Run "bun run build" first.');
const distStats = statSync(distPath);
const distKb = (distStats.size / 1024).toFixed(1);
console.log(`  -> dist/index.js size: ${distKb} KB`);
assert(distStats.size < 1024 * 1024, `dist/index.js exceeds 1 MB limit (${distKb} KB)`);

// 4. Check preview.svg size and structure
console.log('[check] Verifying preview.svg metrics...');
const previewPath = resolve(ROOT, 'preview.svg');
if (existsSync(previewPath)) {
  const previewStats = statSync(previewPath);
  const previewKb = (previewStats.size / 1024).toFixed(1);
  console.log(`  -> preview.svg size: ${previewKb} KB`);
  assert(
    previewStats.size < 150 * 1024,
    `preview.svg exceeds 150 KB limit (${previewKb} KB). Camo proxy may time out.`
  );

  const svgContent = readFileSync(previewPath, 'utf-8');
  assert(svgContent.includes('<svg'), 'preview.svg missing root <svg> tag');
  assert(!svgContent.includes('<script'), 'preview.svg contains prohibited <script> tag');
  assert(svgContent.includes('@keyframes'), 'preview.svg missing CSS @keyframes block');
} else {
  console.log('  -> (preview.svg not found, skipping preview file verification)');
}

console.log('[check] All health and hygiene checks PASSED successfully!');
