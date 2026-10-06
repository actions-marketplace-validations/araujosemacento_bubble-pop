---
name: action-lifecycle-manager
description: Autonomously analyze project state, health metrics (bundle size, SVG render sanity), manage documentation, changelog, and SemVer, and execute commit, push, and release operations to GitHub and the Marketplace.
---

# Action Lifecycle Manager Skill

This skill guides an agent through autonomously analyzing, validating, versioning, documenting, and releasing the **`bubble-pop`** GitHub Action.

---

## Operating Principles & Constraints

1. **Strict No-Emoji Rule**: Never introduce emojis in commit messages, documentation, code, changelogs, or output files.
2. **Deterministic Build**: Always ensure `dist/index.js` is bundled with `bun run build` before committing or releasing.
3. **Camo Proxy Compatibility**: SVGs must stay under 150 KB, avoid `<script>` tags, and rely exclusively on embedded CSS `@keyframes`.

---

## Phase 1: State & Hygiene Analysis

Before making any modifications or preparing a release, assess the current repository state:

1. **Check Git Status**:

   ```bash
   git status
   ```

   - Identify untracked, modified, or staged files.
   - Check current branch (ensure work is on `main` or an appropriate `feat/*` or `fix/*` branch).

2. **Check Recent History & Tags**:

   ```bash
   git log -n 5 --oneline
   git tag --sort=-v:refname | head -n 5
   ```

   - Identify the latest release tag (e.g., `v1.0.0`).

3. **Check for Prohibited Emojis**:
   Ensure no non-ASCII emojis exist in documentation or code files:

   ```bash
   # Verify no emojis in markdown, yaml, or typescript files
   git diff --name-only | xargs grep -P "[^\x00-\x7F]" || true
   ```

---

## Phase 2: Metrics & Health Assessment

Run local verification suites to evaluate codebase health:

1. **Compile and Bundle**:

   ```bash
   bun run build
   ```

   - Verify zero compiler warnings or errors.
   - Inspect bundle size of `dist/index.js` (target: < 1 MB, expected: ~0.47 MB).

2. **Automated Health & Hygiene Suite**:

   ```bash
   bun run check
   ```

   - Runs typechecking (`tsc --noEmit`).
   - Rebuilds `dist/index.js` and verifies bundle size (< 1 MB).
   - Generates `preview.svg` and verifies Camo size constraint (< 150 KB).
   - Enforces strict no-emoji policy across all project files.
   - Verifies `action.yml` configuration and schema.

---

## Phase 3: Analytical SemVer & Documentation

When updates are made to the codebase, analytically determine the version bump:

### 1. Version Bump Decision Matrix

| Change Category | Impact | SemVer Bump | Example |
| --- | --- | --- | --- |
| Input/Output modification in `action.yml` | Breaking | **MAJOR** (`v2.0.0`) | Renaming `github_user_name`, changing input defaults, removing outputs |
| Runtime environment change | Breaking | **MAJOR** (`v2.0.0`) | Upgrading `runs.using` from `node20` to `node24` |
| New optional inputs or themes | Non-breaking | **MINOR** (`v1.1.0`) | Adding `theme: synthwave` or new configurable animation speeds |
| Visual animation enhancements | Non-breaking | **MINOR** (`v1.1.0`) | Improved bubbling curves without breaking dimensions |
| Bug fixes / API adjustments | Non-breaking | **PATCH** (`v1.0.1`) | GraphQL edge case handling, CSS cross-browser bug fixes |
| Optimization / Docs / Chores | Non-breaking | **PATCH** (`v1.0.1`) | SVG size reduction, README updates, CI maintenance |

### 2. Update Version Numbers

Use the automated versioning scripts:

```bash
bun run version:patch   # For non-breaking fixes, docs, refactors
bun run version:minor   # For backward-compatible new features
bun run version:major   # For breaking changes
```

This automatically recalculates and updates `"version"` in `package.json` while printing the canonical git release tag.

### 3. Update Documentation & Changelog

Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/):

- Move items from `## [Unreleased]` into a new section:

  ```markdown
  ## [X.Y.Z] - YYYY-MM-DD

  ### Added
  - Description of additions

  ### Changed
  - Description of changes

  ### Fixed
  - Description of fixes
  ```

---

## Phase 4: Bundling & Committing Changes

1. **Rebundle**:
   Always rebuild `dist/index.js` so it is synchronized with the latest `src/` changes:

   ```bash
   bun run build
   ```

2. **Stage Changes**:

   ```bash
   git add action.yml package.json CHANGELOG.md README.md src/ dist/ .github/ AGENTS.md .agents/
   ```

3. **Craft Conventional Commit**:
   - Format: `<type>(<scope>): <summary>`
   - Types: `feat`, `fix`, `perf`, `docs`, `style`, `refactor`, `chore`.
   - Never include emojis.
   - Example:

     ```bash
     git commit -m "feat(themes): add synthwave visual palette"
     ```

   - For release prep:

     ```bash
     git commit -m "chore(release): prepare v1.1.0"
     ```

---

## Phase 5: Push, Release & Marketplace Distribution

1. **Push Mainline Branch**:

   ```bash
   git push origin main
   ```

2. **Create and Push Release Tag**:
   Tag using the canonical SemVer tag:

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

3. **Automated Release Workflow**:
   Once pushed, `.github/workflows/release.yml` will automatically:
   - Build and verify `dist/index.js`.
   - Update the floating major tag (`vX`, e.g. `v1`).
   - Run `gh release create vX.Y.Z --generate-notes`.
   - Update the GitHub Marketplace listing automatically (after the initial one-time web authorization).

4. **Post-Release Verification**:
   Verify the release using the GitHub CLI:

   ```bash
   gh release view vX.Y.Z
   ```
