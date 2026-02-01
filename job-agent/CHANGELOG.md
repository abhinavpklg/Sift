# Changelog
All notable changes to Sift will be documented in this file.

---

## [0.6.0] - 2025-01-31

### Added
- **Background Service Complete**
  - Service worker with message routing
  - 30+ message types for communication
  - BadgeManager with color-coded progress
  - ATS site detection (10+ platforms)
  - Daily reset alarm
  - Keep-alive mechanism for MV3

### Message Types
- Profile: GET, CREATE, UPDATE, DELETE, SET_ACTIVE
- Settings: GET, UPDATE, SET_LLM_PROVIDER
- Jobs: GET, ADD, MARK_APPLIED, IS_URL_APPLIED, GET_STATS
- Responses: SAVE, FIND_SIMILAR, GET_BEST
- LLM: GENERATE, CHECK_CONNECTION, FORM_RESPONSE, MATCH_FIELD
- Badge: UPDATE, GET_TODAY_COUNT
- Content: READY, FORM_DETECTED, FILL_FORM

---

## [0.5.0] - 2025-01-31

### Added
- **LLM Layer Complete**
  - BaseLLMClient abstract class
  - OllamaClient (local, free)
  - OpenAIClient (GPT-4/3.5)
  - AnthropicClient (Claude 3.5)
  - GeminiClient (free tier)
  - OpenRouterClient (multi-model)
  - GroqClient (ultra-fast)
  - LLMRouter with fallback support
  - Form filling prompt templates

---

## [0.4.0] - 2025-01-31

### Added
- **Storage Layer Complete**
  - ProfileStorage with CRUD, import/export
  - SettingsStorage with LLM configuration
  - JobStorage with URL deduplication
  - ResponseStorage with similarity matching

---

## [0.3.0] - 2025-01-30

### Added
- **Popup UI Complete**
  - Sift branding and gradient icon
  - Today's Progress card
  - Profile switcher
  - LLM status indicator
  - Open Dashboard button

---

## [0.2.0] - 2025-01-30

### Added
- **Project Scaffolding**
  - Turborepo monorepo
  - Vite + React + TypeScript
  - Tailwind CSS
  - Manifest V3

---

## [0.1.0] - 2025-01-30

### Added
- **Documentation**
  - PRD v1.0
  - Module 1 Technical Spec
  - Task breakdown
