# AGENTS.md - Development, Branching, Release & SemVer Guidelines

This document establishes the development standards, branching strategy, versioning rules, and release protocols for the **`bubble-pop`** GitHub Action repository. Both AI agents and human contributors must follow these instructions.

---

## 1. Project Overview & Architecture

- **Goal**: Generate a continuous, dynamic bubbling & popping animated SVG of a user's GitHub contribution grid.
- **Runtime Environment**:
  - **Local Development**: Built and tested with **[Bun](https://bun.sh)** (`bun install`, `bun run preview`, `bun run build`).
  - **Action Target Runtime**: `node20` in GitHub Actions. `dist/index.js` is bundled and minified for execution without external dependencies.
- **Key Constraints**:
  - GitHub's Camo image proxy strips JavaScript and interactive CSS (`:hover`).
  - Animations **must** be implemented via continuous CSS `@keyframes` in an embedded `<style>` block inside the SVG.

---

## 2. Branching Strategy

We use a modified **GitHub Flow** with protected mainline releases:

| Branch / Pattern | Purpose | Rules & Workflow |
| --- | --- | --- |
| `main` | Production-ready source code | Always stable. Pull requests must pass CI before merging. No direct untested pushes. |
| `feat/<name>` | New feature development | Branched from `main`. Squashed or rebased into `main`. |
| `fix/<name>` | Bug fixes and patches | Branched from `main`. Short-lived, targeted fixes. |
| `chore/<name>` | Maintenance, deps, docs | Non-functional updates. |

### Protected Branches & Merging

1. Always keep `dist/index.js` synchronized with `src/` changes before or during release.
2. Commit messages must adhere to **Conventional Commits** (see Section 4).

---

## 3. Semantic Versioning (SemVer) for GitHub Actions

We follow **[SemVer 2.0.0](https://semver.org/)** tailored for GitHub Actions lifecycle:

### `v<MAJOR>.<MINOR>.<PATCH>` (e.g., `v1.2.3`)

#### **MAJOR (`v2.0.0`) - Breaking Changes**

Triggered when an existing workflow using the action would break without configuration changes:

- Renaming, removing, or changing defaults of inputs in `action.yml`.
- Modifying or removing action `outputs`.
- Changing the minimum GitHub runner environment (e.g., migrating `runs.using` from `node20` to `node24`).
- Breaking changes to SVG structure that break downstream parsing scripts.

#### **MINOR (`v1.1.0`) - Backward-Compatible Additions**

Triggered when adding features that do not break existing installations:

- Adding new optional inputs to `action.yml` (with backward-compatible defaults).
- Adding new visual themes (e.g., `theme: halloween`, `theme: synthwave`).
- New output variables.
- Visual animation enhancements that preserve existing dimensions and core functionality.

#### **PATCH (`v1.0.1`) - Bug Fixes & Improvements**

Triggered for non-breaking fixes:

- Fixing GraphQL API error handling or pagination edge cases.
- CSS adjustments for cross-browser SVG rendering consistency.
- Performance and file size optimizations for the generated SVG.
- Dependency updates and internal refactoring.

---

## 4. Conventional Commits & Changelog Standards

Every commit should follow the Conventional Commits specification:

```text
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: A new feature or capability (bumps MINOR).
- `fix`: A bug fix (bumps PATCH).
- `perf`: Performance optimization (SVG size reduction, faster build).
- `docs`: Documentation updates only (`README.md`, `AGENTS.md`).
- `style`: Formatting changes that do not affect code logic.
- `refactor`: Code refactoring without changing behavior or adding features.
- `chore`: Build scripts, CI workflow updates, dependencies.

### Breaking Changes

Indicated by an exclamation mark before the colon or a `BREAKING CHANGE:` footer:

```text
feat(inputs)!: rename input github_user_name to user
```

---

## 5. Release Process & Floating Tags

GitHub Actions use **floating major version tags** (e.g. `v1`) so consumers can receive non-breaking updates without updating their workflow files.

### Tag Structure

- **Canonical Release Tag**: `vX.Y.Z` (e.g. `v1.0.0`, `v1.1.0`)
- **Floating Major Tag**: `vX` (e.g. `v1`), which always points to the latest `v1.Y.Z` commit.

### Release Workflow (`.github/workflows/release.yml`)

Whenever a tag matching `v*.*.*` is pushed:

1. Bun installs dependencies with `bun install --frozen-lockfile`.
2. Bundles the production script via `bun run build`.
3. Verifies `dist/index.js` is up to date and commits it if needed.
4. Moves the floating tag (`v1`) to point to the current commit (`git tag -fa v1 -m "Update v1" && git push origin v1 --force`).
5. Generates the GitHub Release with automated changelog notes via `gh release create`.

### Step-by-Step: Cutting a New Release

1. Ensure your working branch is up to date and clean:

   ```bash
   git status
   ```

2. Verify local builds and previews:

   ```bash
   bun run build
   bun run preview
   ```

3. Update `CHANGELOG.md` if maintained manually.
4. Commit any changes:

   ```bash
   git add -A
   git commit -m "chore(release): prepare v1.0.0"
   git push origin main
   ```

5. Tag and push:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

6. The automated workflow triggers and handles bundling, major tag updating, and release publishing.

---

## 6. Testing & Quality Assurance Checklist

Before submitting PRs or releasing:

- [ ] Run `bun run build` to ensure TypeScript compiles and `dist/index.js` bundles cleanly without warnings.
- [ ] Run `bun run preview` to inspect `preview.svg` in both dark and light contexts.
- [ ] Ensure no emojis are introduced into the codebase, documentation, or commit messages.
- [ ] Ensure SVG size does not exceed reasonable limits (< 150 KB) to prevent Camo caching timeouts.

---

## 7. Style & Formatting Constraints

- **No Emojis**: Do not use emojis anywhere in the project, including markdown documentation, commit messages, code comments, and output templates. Maintain a clean, professional, plain-text standard.
