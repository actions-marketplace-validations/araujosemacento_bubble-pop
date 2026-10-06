# Bubble Pop GitHub Contribution Grid

> A public GitHub Action that generates an autonomous, cyclic animated SVG of your GitHub contribution grid with squares turning into buoyant bubbles and popping!

Inspired by [`Platane/snk`](https://github.com/Platane/snk), but designed with a dynamic **bubbling & popping** physics effect powered by continuous CSS `@keyframes`.

---

## Features

- **No JavaScript Needed at Runtime:** Uses continuous embedded CSS `@keyframes` inside the SVG, ensuring 100% compatibility with GitHub's Camo image proxy (`<img>` tags in markdown).
- **Organic Bubbling Dynamics:** Every square has a pseudo-randomized animation delay and duration variance, creating continuous bubbling across the calendar.
- **Activity-Weighted Physics:** Higher contribution squares swell larger, float higher, and pop with greater energy.
- **Theme Support:** Supports `auto` (adapts to GitHub dark/light mode via `@media (prefers-color-scheme: light)`), explicit `dark`, or `light`.
- **Fast & Lightweight:** Pure vector SVG output without heavy external dependencies.

---

## Quick Start (GitHub Actions Workflow)

Add a workflow in your repository (e.g. `.github/workflows/bubble-pop.yml`) to automatically update your contribution SVG on a schedule:

```yaml
name: Generate Bubble Pop Contribution Grid

on:
  schedule:
    # Run daily at midnight
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
        uses: melo/bubble-pop@v1 # Replace with your action path/tag
        with:
          github_user_name: ${{ github.repository_owner }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          output_path: dist/github-contribution-grid-bubble.svg
          theme: auto

      - name: Push to Output Branch
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Embedding in your README

Once generated and pushed to your `output` branch, embed the raw SVG in your profile `README.md`:

```markdown
![Contribution Bubbles](https://raw.githubusercontent.com/<YOUR_USERNAME>/<YOUR_USERNAME>/output/github-contribution-grid-bubble.svg)
```

---

## Local Development

This project is built with **TypeScript** and runs locally using **[Bun](https://bun.sh)**.

### 1. Install dependencies

```bash
bun install
```

### 2. Generate a local preview (Mock Data)

Generates `preview.svg` and `preview.html` with realistic mock data instantly (no token needed):

```bash
bun run preview
```

### 3. Generate with your real GitHub data

Pass your GitHub username and Personal Access Token (PAT):

```bash
bun src/local.ts --username <YOUR_USERNAME> --token <YOUR_GITHUB_PAT>
```

### 4. Build the action bundle

Bundles the action into `dist/index.js` for GitHub Actions runners:

```bash
bun run build
```

---

## Action Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `github_user_name` | The GitHub username to fetch the contribution grid for | **Yes** | - |
| `github_token` | GitHub PAT or `GITHUB_TOKEN` to authorize the GraphQL API request | **Yes** | - |
| `output_path` | The path and filename where the generated SVG will be saved | No | `dist/github-contribution-grid-bubble.svg` |
| `theme` | Theme mode: `auto` (system preference), `dark`, or `light` | No | `auto` |

---

## License

MIT (c) [G. Melo](LICENSE.md)
