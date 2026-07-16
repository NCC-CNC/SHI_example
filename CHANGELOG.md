# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Initial project harness: issue and PR templates, CI workflow skeleton,
  Dependabot, contribution and security policies, docs structure (design,
  decisions, handoffs), and Claude Code working rules.
- GNU General Public License v3.0.
- Project design docs (brief, SHI model spec, example scenarios, milestones) and
  ADRs for the stack and SHI model simplifications; project identity filled into
  CLAUDE.md and README.
- M0 scaffold: Vite + React + TypeScript app, Vitest with coverage gate on the
  engine, ESLint + Prettier, CI running format/lint/typecheck/test/build, and a
  GitHub Pages deploy workflow. First engine module (constants) with tests.
- M1 SHI engine (pure, headless): suitability/AOH fields, area score, GISfrag
  connectivity (distance-to-edge transform), Species Habitat Score with a
  connectivity on/off toggle, and overall + per-group aggregation. Hand-checked
  Vitest suite (38 tests).
