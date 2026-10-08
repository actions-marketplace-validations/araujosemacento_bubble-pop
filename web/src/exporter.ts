export function downloadSvgFile(username: string, svgContent: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bubble-pop-${username || 'grid'}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateWorkflowYaml(username: string, theme: string): string {
  return `name: Generate Bubble Pop Contribution Grid

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - name: Generate Contribution Bubbles SVG
        uses: araujosemacento/bubble-pop@v1
        with:
          github_user_name: ${username || '${{ github.repository_owner }}'}
          github_token: \${{ secrets.GITHUB_TOKEN }}
          output_path: dist/github-contribution-grid-bubble.svg
          theme: ${theme}

      - name: Push to Output Branch
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

export function generateMarkdownBadge(username: string): string {
  const user = username || 'YOUR_USERNAME';
  return `![Contribution Bubbles](https://raw.githubusercontent.com/${user}/${user}/output/github-contribution-grid-bubble.svg)`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('[exporter] Clipboard copy failed:', err);
    return false;
  }
}
