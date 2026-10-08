# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-08

### Added

- Configurable SVG element visibility inputs in `action.yml`: `show_header` (title and total counts), `show_labels` (month and weekday labels), and `show_avatar` (user avatar in header).
- Inlined base64 avatar embedding in core action runner to survive GitHub Camo image proxy stripping and offline rendering.
- Circular avatar fallback and border styling inside the SVG markup.
- Interactive toggle buttons for header, labels, and avatar in the web preview visualizer with reactive SVG re-rendering.
- Preset profile pill redesign with unified borders and circular contextual info icon buttons matching design specifications.
- Interactive contextual bio tooltips in web preview for presets (octocat, torvalds, antirez, yyx990803, gaearon).
- Added Salvatore Sanfilippo (antirez) preset to quick-pick options.
- Dynamic stacking z-index handling ensuring tooltips from upper preset rows paint cleanly above lower rows.
- Two-row layout grouping presets into centered rows of three tags each for visual balance.

### Changed

- SVG layout padding dynamically recalculates across all combinations of header and label states to maintain a compact, balanced card geometry.
- Workflow export generator in web preview updated to output show_header, show_labels, and show_avatar parameters.

## [1.0.1] - 2026-10-07

### Changed

- Updated default theme in web visualizer from rose-pine to auto, adapting to system and browser color scheme on first load.
- Added dynamic auto theme tokens to web visualizer CSS with GitHub Dark default and GitHub Light on prefers-color-scheme light media query.

## [1.0.0] - 2026-10-07

### Added

- Expanded visual themes supporting 13 palettes across dark and light environments (auto, dark/github, gitlab-dark, codeberg-dark, rose-pine, dracula, mocha, light/github, gitlab-light, codeberg-light, rose-pine-dawn, alucard, latte).
- Interactive web preview visualizer (web/) built with Vite and TypeScript, featuring live canvas rendering, smooth in-place CSS theme transitions, custom optgroup select, speed controls, token configuration, and multi-format export utilities.
- GitHub Pages automated deployment workflow (.github/workflows/pages.yml).
- Adaptive SVG favicon supporting dark and light browser color schemes.
- Marketplace listing navigation link in footer and gray-dark branding color scheme.

### Changed

- Overhauled pseudo-random generator with 32-bit Murmur/SplitMix integer hash2D to eradicate vertical column banding.
- Implemented incommensurable golden-ratio duration scaling to eliminate periodic harmonic resonance.
- Replaced positive delays with negative phase delays to start animations immediately upon load without initial pauses.
- Implemented dual-phase keyframe profiles (bubblePopA / bubblePopB, bubbleBurstA / bubbleBurstB) to prevent synchronized bursts and collective lulls.
- Restricted L0 inactive contribution days strictly to gentle vertical wave undulations without bubble morphing or bursting.

### Fixed

- Preserved multi-line formatting and indentation for clipboard copy of workflow YAML and SVG markup.

## [0.1.0] - 2026-10-06

### Added

- Initial public release of `bubble-pop` GitHub Action.
- GitHub GraphQL API integration to fetch user contribution grids.
- Continuous pure CSS `@keyframes` bubbling and popping animation inside the SVG.
- Activity-weighted bubble physics (higher contribution cells swell and burst with higher energy).
- Theme support (`auto` with system prefers-color-scheme, `dark`, and `light`).
- Local preview generation script with realistic mock data (`bun run preview`).
- Automated release workflow with floating major version tag (`v1`) management.
- Health check and versioning automation scripts (`bun run check`, `bun run version:*`).
- Documentation, `action.yml`, and `AGENTS.md` guidelines.
