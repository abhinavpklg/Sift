# Changelog

## [Unreleased]
- Background service worker
- Content scripts for form detection
- Auto-fill functionality

---

## [0.5.0] - 2025-01-31

### Added
- **LLM Layer Complete** 🎉
  - Multi-provider support with unified interface
  - **Ollama** - Local LLM (free, private)
  - **OpenAI** - GPT-4o, GPT-4, GPT-3.5
  - **Anthropic** - Claude 3.5 Sonnet/Haiku
  - **Google Gemini** - Gemini 1.5 Pro/Flash (free tier)
  - **OpenRouter** - Access 100+ models (free tier available)
  - **Groq** - Ultra-fast inference (free tier)
  
- **LLMRouter** - Unified interface
  - Automatic fallback support
  - Provider switching at runtime
  - Settings integration
  - Connection health monitoring

- **Form Filling Helpers**
  - `matchFieldToProfile()` - AI field matching
  - `generateFormResponse()` - Answer generation
  - `summarizeJobDescription()` - Job summaries
  - `extractTechStack()` - Tech extraction
  - `calculateRelevanceScore()` - Job matching

- **Prompt Templates**
  - Field matching prompts
  - Response generation prompts
  - Cover letter generation
  - Common field patterns

---

## [0.4.0] - 2025-01-31

### Added
- **Storage Layer Complete**
  - ProfileStorage - User profiles CRUD
  - SettingsStorage - App configuration
  - JobStorage - Job tracking & deduplication
  - ResponseStorage - AI learning from inputs

---

## [0.3.0] - 2025-01-30

### Added
- Popup UI complete
- Options page shell
- Rebranded to "Sift"

---

## [0.2.0] - 2025-01-30

### Added
- Project scaffolding
- Turborepo + pnpm workspace
- Vite + React + TypeScript

---

## [0.1.0] - 2025-01-30

### Added
- Initial planning
- PRD v1.0
- Architecture design
