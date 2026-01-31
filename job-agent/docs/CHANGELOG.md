# Changelog
All notable changes to the AI Job Agent project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Project scaffolding (monorepo, build tools)
- Chrome extension boilerplate
- Basic popup UI
- Storage layer implementation
- Ollama client integration
- Form detection for Greenhouse & Lever

---

## [0.1.0] - 2025-01-30

### Added
- **Documentation**
  - Product Requirements Document (PRD v1.0)
  - Module 1 Technical Specification
  - Task Cards breakdown (47 tasks across 7 phases)
  - Project State tracking document
  - Context Resume document for AI continuity
  - This changelog

- **Architecture Decisions**
  - Monorepo structure with Turborepo + pnpm
  - Chrome Extension with Manifest V3
  - React + TypeScript + Vite for extension
  - Local-first storage with optional cloud sync
  - Ollama integration for local LLM
  
- **Planning**
  - Identified 65 ATS platforms across 7 categories
  - Prioritized MVP platforms (Greenhouse, Lever, Ashby, SmartRecruiters, Workday, iCIMS)
  - Selected Llama 3.2 8B Instruct as primary local model
  - Designed form detection and auto-fill algorithms
  - Created 20-week development timeline

### Technical Decisions
- **LLM**: Llama 3.2 8B Instruct (Q4_K_M) for M1 Pro compatibility
- **Storage**: Chrome Storage API (local + sync)
- **Auth**: Optional Google OAuth for cross-device sync
- **Testing**: Vitest for unit/integration tests

### Documentation Files Created
| File | Purpose |
|------|---------|
| `PRD_v1.0.md` | Complete product requirements |
| `MODULE_1_SPEC.md` | Technical specification for Module 1 |
| `TASK_CARDS_v0.1.0.json` | Actionable task breakdown |
| `PROJECT_STATE_v0.1.0.md` | Progress tracking |
| `CONTEXT_RESUME_v0.1.0.md` | AI session continuity |
| `CHANGELOG.md` | Version history (this file) |

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, major feature releases
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, documentation updates

## Phase Mapping

| Version Range | Phase |
|---------------|-------|
| 0.1.x | Planning & Documentation |
| 0.2.x | Scaffolding |
| 0.3.x | Module 1 - Popup UI |
| 0.4.x | Module 1 - Storage |
| 0.5.x | Module 1 - LLM Integration |
| 0.6.x | Module 1 - Background Service |
| 0.7.x | Module 1 - Content Scripts |
| 0.8.x | Module 1 - Options Page |
| 0.9.x | Module 1 - Testing & Polish |
| 1.0.0 | Module 1 Complete (MVP) |

---

## Links

- [Project Repository](#) (TBD)
- [PRD Document](./docs/PRD_v1.0.md)
- [Task Cards](./docs/TASK_CARDS.json)
