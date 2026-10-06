import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchUserContributions, generateMockCalendar } from './api';
import { renderContributionSvg } from './svg';
import type { ContributionCalendar } from './types';

function parseArgs(): {
  username?: string;
  token?: string;
  outputPath: string;
  theme: 'auto' | 'dark' | 'light';
} {
  const args = process.argv.slice(2);
  let username = process.env.GITHUB_USER_NAME;
  let token = process.env.GITHUB_TOKEN;
  let outputPath = 'preview.svg';
  let theme: 'auto' | 'dark' | 'light' = 'auto';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--username' || arg === '-u') {
      username = args[++i];
    } else if (arg === '--token' || arg === '-t') {
      token = args[++i];
    } else if (arg === '--out' || arg === '-o') {
      outputPath = args[++i];
    } else if (arg === '--theme') {
      const t = args[++i];
      if (t === 'light' || t === 'dark' || t === 'auto') {
        theme = t;
      }
    }
  }

  return { username, token, outputPath, theme };
}

async function main() {
  const { username, token, outputPath, theme } = parseArgs();

  let calendar: ContributionCalendar;

  if (username && token) {
    console.log(`[bubble-pop] Fetching live contributions for "${username}" from GitHub...`);
    calendar = await fetchUserContributions(username, token);
  } else {
    console.log('[bubble-pop] No GitHub token/user provided. Using realistic mock contribution data.');
    console.log('             (Tip: pass --username <user> --token <pat> to test with your real profile!)');
    calendar = generateMockCalendar();
  }

  console.log(`[bubble-pop] Rendering SVG with ${calendar.totalContributions} total contributions...`);
  const svgContent = renderContributionSvg(calendar, {
    username: username || 'octocat',
    theme,
  });

  const absoluteOut = resolve(process.cwd(), outputPath);
  writeFileSync(absoluteOut, svgContent, 'utf-8');

  // Also create a tiny preview HTML wrapper for easy browser viewing
  const htmlPath = resolve(process.cwd(), 'preview.html');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bubble Pop Contribution Grid Preview</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #e6edf3;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .preview-card {
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
      border-radius: 12px;
      overflow: hidden;
      display: inline-block;
    }
    .info {
      font-size: 14px;
      color: #8b949e;
      text-align: center;
    }
  </style>
</head>
<body>
  <h2>GitHub Contribution Grid Bubble Pop Preview</h2>
  <div class="info">Continuous pure CSS @keyframes animation (compatible with GitHub Camo Proxy)</div>
  <div class="preview-card">
    <img src="${outputPath}" alt="Contribution Bubbles" />
  </div>
</body>
</html>`;

  writeFileSync(htmlPath, htmlContent, 'utf-8');

  console.log(`[bubble-pop] Done! Generated files:`);
  console.log(`  -> SVG:  ${absoluteOut}`);
  console.log(`  -> HTML: ${htmlPath}`);
}

main().catch((err) => {
  console.error('[bubble-pop] Error:', err);
  process.exit(1);
});
