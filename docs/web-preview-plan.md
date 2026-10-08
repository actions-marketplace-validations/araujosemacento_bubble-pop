# Web Preview Implementation Plan

This document establishes the architecture, technical decisions, and phased implementation roadmap for the bubble-pop interactive web preview hosted on GitHub Pages.

---

## 1. Project Goal & Overview

Provide an interactive web application on GitHub Pages that allows developers to:

1. Enter any GitHub username to visualize their animated bubbling contribution grid in real time.
2. Test visual parameters such as theme and animation speed.
3. Download the generated animated SVG directly.
4. Copy pre-configured GitHub Action workflow snippets and README markdown tags.

---

## 2. Stylistic and Visual Constraints

Strict design specifications must be enforced across all markup, CSS, and copy:

1. Layout Structure: Absolutely no card layouts. Distinct sections must be delineated solely by horizontal or vertical dividers (1px solid divider borders).
2. Typography and Symbols: Zero emojis. No em-dashes or en-dashes; only standard ASCII hyphens (-) are permitted.
3. List Formatting: No bullet points anywhere in the UI or documentation; use structured tables, numbered steps, or direct prose headings.
4. Color and Surface Styling: Zero gradients. Only solid colors, flat surfaces, and sharp border delineations are allowed without explicit directive commands.

---

## 3. Core Architectural Decisions

| # | Decision Area | Resolution | Rationale |
| --- | --- | --- | --- |
| 1 | Branching and Deployment | web/ on main + GitHub Actions Pages workflow | Single repository structure keeps action and preview in sync. Automatic build and deploy to GitHub Pages without managing a detached orphan branch manually. |
| 2 | Data Ingestion and Auth | Hybrid: Public API + Optional PAT + Mock Fallback | Zero-friction for public accounts via public aggregator (jogruber.de). Optional token input stored strictly in browser memory (sessionStorage) for private contributions. Instant fallback to mock generator if offline. |
| 3 | Framework and Tooling | Vite + Vanilla TypeScript + Vanilla CSS (Bun) | Ultra-fast build with zero framework runtime bloat (< 30 KB total). Native ES modules, full TypeScript type safety, and instant dev server via Bun. |
| 4 | Code Sharing | Direct TypeScript Imports from src/ | web/ directly imports renderContributionSvg from src/svg.ts and types from src/types.ts. Single source of truth: any SVG enhancements immediately reflect in both the action and web app. |
| 5 | Feature Set and UI | Full Interactive Suite with Divider Layout | Username lookup with enter-to-search, quick-pick profile presets (octocat, torvalds, gaearon), theme selector (auto, dark, light), speed slider, SVG download, and one-click workflow copy. |

---

## 4. Directory & File Structure

```text
bubble-pop/
├── .github/
│   └── workflows/
│       ├── release.yml         # Action release and marketplace workflow
│       └── pages.yml           # GitHub Pages automated build & deploy workflow
├── src/                        # Core GitHub Action & SVG rendering logic
│   ├── svg.ts                  # Pure SVG + CSS keyframes generator (shared)
│   ├── types.ts                # Shared TypeScript definitions
│   └── api.ts                  # GitHub GraphQL fetcher & mock generator
├── web/                        # Web preview application
│   ├── index.html              # HTML shell with divider-based layout containers
│   ├── vite.config.ts          # Vite build configuration (base path for GitHub Pages)
│   ├── package.json            # Web app dependencies and dev scripts
│   └── src/
│       ├── main.ts             # Application entrypoint & DOM event handling
│       ├── adapter.ts          # Client-side GitHub contributions fetcher & normalizer
│       ├── state.ts            # Reactive UI state (username, theme, duration, token)
│       └── style.css           # Vanilla CSS (solid backgrounds, border dividers, no gradients)
└── package.json                # Root package with dev:web and build:web orchestration
```

---

## 5. Technical Specifications

### A. Data Adapter (web/src/adapter.ts)

1. Primary endpoint: <https://github-contributions-api.jogruber.de/v4/${username}?y=last>
2. Secondary endpoint (if PAT provided): Direct GitHub GraphQL query (<https://api.github.com/graphql>)
3. Fallback: generateMockCalendar() from src/api.ts
4. Normalization: Transforms external API response to the project's internal ContributionCalendar interface.

### B. UI Design and Styling (web/src/style.css)

1. Aesthetic: Deep dark mode (#0d1117 background), solid panels, crisp 1px borders (#30363d), modern system typography (Inter, -apple-system).
2. Divider Architecture: No floating cards or elevation shadows. Structural boundaries use 1px vertical borders (border-right) and horizontal borders (border-bottom).
3. Layout Zones:
   - Header zone: Brand title and repository reference links, bounded by a bottom divider.
   - Controls bar: Inline input field, preset tags, theme segmented control, and speed input separated by vertical dividers.
   - Stage zone: Full-width canvas container housing the SVG display.
   - Action zone: Horizontal footer drawer separated by a top divider with SVG export and workflow copy commands.
4. Restraint Compliance: Zero emojis, zero gradients, zero bullet points, zero dashes (hyphens only).

### C. Build and Deployment (.github/workflows/pages.yml)

1. Trigger: Push to main with changes in web/ or src/, plus workflow_dispatch.
2. Steps:
   - Step 1: Checkout repository with fetch-depth: 0.
   - Step 2: Setup Bun environment (oven-sh/setup-bun@v2).
   - Step 3: Install dependencies and run bun run build:web.
   - Step 4: Deploy web/dist via actions/upload-pages-artifact@v3 and actions/deploy-pages@v4.

---

## 6. Phased Implementation Roadmap

### Phase 1: Project & Tooling Setup

1. Add web scripts to root package.json (dev:web, build:web).
2. Configure web/vite.config.ts with correct base path for GitHub Pages (/bubble-pop/).
3. Create web/package.json and install Vite + TypeScript.

### Phase 2: Data Adapter & Logic Integration

1. Implement web/src/adapter.ts with aggregator API handling, optional PAT support, and mock fallback.
2. Wire direct imports from src/svg.ts and src/types.ts.

### Phase 3: Interactive UI & Component Assembly

1. Build web/index.html structure using horizontal and vertical divider sections (strictly no cards).
2. Implement web/src/style.css following flat solid styling, border dividers, and zero gradients.
3. Implement web/src/main.ts managing input events, live rendering, loading states, and error handling.

### Phase 4: Export Tools & Convenience Actions

1. Implement one-click SVG blob download (bubble-pop-[username].svg).
2. Implement copy-to-clipboard for .github/workflows/bubble-pop.yml.
3. Implement copy-to-clipboard for README markdown badge.

### Phase 5: GitHub Pages CI/CD & Verification

1. Create .github/workflows/pages.yml.
2. Run full local build and preview test with bun run build:web.
3. Validate that all checks in bun run check pass without errors, emojis, or prohibited formatting.
