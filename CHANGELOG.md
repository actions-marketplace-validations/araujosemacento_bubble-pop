# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
