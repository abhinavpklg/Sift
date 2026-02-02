# Changelog
All notable changes to Sift will be documented in this file.

---

## [0.7.0] - 2025-01-31

### Added
- **Content Scripts Complete**
  - Platform detection for 10 ATS systems
  - FormDetector with 40+ profile key patterns
  - AutoFiller with React/Vue event compatibility
  - Support for text, email, tel, select, radio, checkbox fields
  - Simulated typing option
  - Console debug API (window.__sift)

### Known Issues
- Greenhouse: Forms in iframes not detected
- Ashby: React SPA loads slowly, form not found
- qwen3: LLM returns empty text (model-specific)
- Ollama: CORS requires OLLAMA_ORIGINS env var

### Tested Platforms
- ✅ Lever (fully working)
- ⚠️ Greenhouse (iframe issue)
- ⚠️ Ashby (slow load issue)

---

## [0.6.0] - 2025-01-31

### Added
- **Background Service Complete**
  - Service worker with 30+ message types
  - BadgeManager with color-coded progress
  - ATS site detection
  - Daily reset alarm

---

## [0.5.0] - 2025-01-31

### Added
- **LLM Layer Complete**
  - 6 providers: Ollama, OpenAI, Anthropic, Gemini, OpenRouter, Groq
  - LLMRouter with fallback support
  - Form filling prompt templates

---

## [0.4.0] - 2025-01-31

### Added
- **Storage Layer Complete**
  - ProfileStorage, SettingsStorage, JobStorage, ResponseStorage
  - URL deduplication
  - Response similarity matching

---

## [0.3.0] - 2025-01-30

### Added
- **Popup UI Complete**
  - Sift branding
  - Today's Progress card
  - Profile switcher
  - LLM status indicator

---

## [0.2.0] - 2025-01-30

### Added
- **Project Scaffolding**
  - Turborepo monorepo
  - Vite + React + TypeScript
  - Manifest V3

---

## [0.1.0] - 2025-01-30

### Added
- **Documentation**
  - PRD v1.0
  - Technical spec
