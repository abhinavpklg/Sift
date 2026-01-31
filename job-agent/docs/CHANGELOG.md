# Changelog
All notable changes to Sift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Storage layer (ProfileStorage, SettingsStorage, JobStorage, ResponseStorage)
- LLM integration (Ollama client, prompt templates)
- Form detection and auto-fill for Greenhouse & Lever
- Job scraping engine

---

## [0.3.0] - 2025-01-30

### Added
- **Popup UI Complete**
  - Header with Sift branding and gradient icon
  - Today's Progress card with visual progress bar
  - Profile switcher dropdown
  - Quick action buttons (Fill Form, Start Sifting)
  - LLM connection status indicator in footer
  - Open Dashboard button

- **Options Page (Dashboard)**
  - Sidebar navigation with 5 sections
  - Profile, Job Queue, History, AI Config, Settings pages
  - Placeholder content for future implementation

- **Rebranding to "Sift"**
  - New name: Sift
  - Tagline: "Sift smarter. Apply faster."
  - Updated all UI references
  - Updated manifest and README

### Fixed
- Turbo v2 `pipeline` → `tasks` migration
- TypeScript strict mode errors
- Missing CSS files
- Icon file generation

---

## [0.2.0] - 2025-01-30

### Added
- **Project Scaffolding**
  - Turborepo monorepo with pnpm workspaces
  - Chrome Extension package with Vite + React
  - Tailwind CSS configuration
  - Manifest V3 setup
  - Vitest testing framework with Chrome API mocks
  - Shared types package

- **Build Configuration**
  - TypeScript with strict mode
  - Path aliases (@/, @shared/)
  - Development and production builds

---

## [0.1.0] - 2025-01-30

### Added
- **Documentation**
  - Product Requirements Document (PRD v1.0)
  - Module 1 Technical Specification
  - Task Cards breakdown (47 tasks)
  - Project State tracking
  - Context Resume for AI sessions
  - Changelog

- **Architecture Decisions**
  - Local-first storage with optional cloud sync
  - Ollama for local LLM
  - 65 ATS platforms catalogued
  - Llama 3.2 8B selected for M1 Pro

---

## Version Numbering

| Version Range | Phase |
|---------------|-------|
| 0.1.x | Planning |
| 0.2.x | Scaffolding |
| 0.3.x | Popup UI |
| 0.4.x | Storage Layer |
| 0.5.x | LLM Integration |
| 0.6.x | Background Service |
| 0.7.x | Content Scripts |
| 0.8.x | Options Pages |
| 0.9.x | Testing & Polish |
| 1.0.0 | MVP Release |
