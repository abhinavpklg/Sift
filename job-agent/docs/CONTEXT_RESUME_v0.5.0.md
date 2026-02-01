# Sift - Context Resume Document
## Version: 0.5.0 | For: AI Development Sessions
## Last Updated: 2025-01-31

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: Storage + LLM Layers COMPLETE ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: Background Service (BG-001) or Content Scripts (CONTENT-001)

---

## 📊 Progress Overview

```
Planning       ████████████ 100% ✅
Scaffolding    ████████████ 100% ✅
Popup UI       ████████████ 100% ✅
Storage Layer  ████████████ 100% ✅
LLM Layer      ████████████ 100% ✅ ← JUST COMPLETED
Background     ░░░░░░░░░░░░   0% ← NEXT
Content Scripts░░░░░░░░░░░░   0%

Progress: 20/47 tasks (43%) | Tests: 101 passing
```

---

## 🏗️ What's Been Built

### Storage Layer (`shared/storage/`)

| Class | Purpose | Key Methods |
|-------|---------|-------------|
| `ProfileStorage` | User profiles | getAll, create, update, delete, export, import |
| `SettingsStorage` | App settings | getAll, update, setLLMProvider, credentials |
| `JobStorage` | Job tracking | addScrapedJob, markAsApplied, isUrlApplied, getStats |
| `ResponseStorage` | AI learning | save, findSimilar, findBestMatch, recordUsage |

### LLM Layer (`shared/llm/`)

| Component | Purpose |
|-----------|---------|
| `types.ts` | LLMProvider, LLMConfig, PROVIDER_INFO |
| `BaseLLMClient.ts` | Abstract base with timeout/error handling |
| `OllamaClient.ts` | Local Ollama (free) |
| `OpenAIClient.ts` | GPT-4/3.5 |
| `AnthropicClient.ts` | Claude 3.5 |
| `GeminiClient.ts` | Google AI (free tier) |
| `OpenRouterClient.ts` | Multi-model (free tier) |
| `GroqClient.ts` | Ultra-fast (free tier) |
| `LLMRouter.ts` | Unified interface + fallback |
| `prompts.ts` | Form filling templates |

**Supported Providers:**
| Provider | Free | Best For |
|----------|------|----------|
| Ollama | ✅ | Privacy, offline |
| Gemini | ✅ | Large context |
| OpenRouter | ✅ | Model variety |
| Groq | ✅ | Speed |
| OpenAI | ❌ | GPT-4 quality |
| Anthropic | ❌ | Claude quality |

---

## 💻 Code Examples

### Using Storage

```typescript
import { ProfileStorage, SettingsStorage, JobStorage, ResponseStorage } from './shared/storage';

// Profiles
const profile = await ProfileStorage.getActive();
await ProfileStorage.create({ name: 'Tech Jobs', personalInfo: {...} });

// Settings
await SettingsStorage.setLLMProvider('ollama', 'http://localhost:11434');
const settings = await SettingsStorage.getAll();

// Jobs (prevents duplicates!)
const alreadyApplied = await JobStorage.isUrlApplied(jobUrl);
await JobStorage.markAsApplied({ profileId, url, title, company, notes });
const stats = await JobStorage.getStats(); // { todayApplied, thisWeekApplied, ... }

// AI Learning
await ResponseStorage.save(question, answer);
const matches = await ResponseStorage.findSimilar(newQuestion);
```

### Using LLM

```typescript
import { LLMRouter } from './shared/llm';

// Create router (local Ollama)
const router = LLMRouter.fromSettings({ provider: 'ollama' });

// Or cloud provider with free tier
const router = LLMRouter.fromSettings({
  provider: 'groq',
  apiKey: 'your-key',
});

// Check connection
const status = await router.checkConnection();
console.log(status.connected ? '✅ Connected' : '❌ Disconnected');

// Generate text
const response = await router.generate('Hello', {
  systemPrompt: 'You are helpful.',
  maxTokens: 500,
});

// Form filling helpers
const answer = await router.generateFormResponse(question, profileContext);
const match = await router.matchFieldToProfile('First Name', 'text', profileKeys);
const summary = await router.summarizeJobDescription(jobDescription);
const techStack = await router.extractTechStack(jobDescription);
const score = await router.calculateRelevanceScore(skills, jobDescription);

// Switch providers at runtime
router.switchProvider('gemini', 'your-gemini-key');
```

---

## 📁 Project Structure

```
job-agent/
├── apps/extension/
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   └── src/
│       ├── popup/           ✅ Complete
│       ├── options/         ✅ Shell complete
│       ├── shared/
│       │   ├── types/       ✅ profile, settings, job, response
│       │   ├── storage/     ✅ Profile, Settings, Job, Response
│       │   └── llm/         ✅ 6 providers + router + prompts
│       ├── background/      🔄 Next (service worker)
│       └── content/         🔄 Next (form detection)
├── packages/shared-types/
├── docs/
│   ├── PROJECT_STATE_v0.5.0.md
│   ├── CONTEXT_RESUME_v0.5.0.md (this file)
│   └── TASK_CARDS_v0.5.0.json
└── CHANGELOG.md
```

---

## 🚀 Next Phase Options

### Option A: Background Service (Recommended First)

| Task | Description |
|------|-------------|
| BG-001 | Service worker setup, message listener |
| BG-002 | Message handler (popup ↔ content ↔ background) |
| BG-003 | Badge counter (today's applications) |

**Why first?** Content scripts need messaging to communicate with storage/LLM.

### Option B: Content Scripts

| Task | Description |
|------|-------------|
| CONTENT-001 | Entry point, load on ATS sites |
| CONTENT-002 | FormDetector - find form fields |
| CONTENT-003 | Greenhouse-specific detection |
| CONTENT-004 | Lever-specific detection |
| CONTENT-005 | AutoFiller - fill form fields |

---

## 🔧 Quick Commands

```bash
# Install dependencies
pnpm install

# Development mode
pnpm --filter extension dev

# Build
pnpm build

# Run tests
pnpm --filter extension test

# Load in Chrome
# chrome://extensions → Developer mode → Load unpacked → dist/
```

---

## 💬 Prompt to Resume Development

```
I'm continuing Sift development.

Context files:
- PROJECT_STATE_v0.5.0.md
- CONTEXT_RESUME_v0.5.0.md

Current task: [BG-001 or CONTENT-001]

Please generate the implementation with:
1. All required files
2. TypeScript types
3. Unit tests
4. Verification steps
```

---

## 🔑 Key Design Decisions

1. **Local-first**: Works without login, Ollama for privacy
2. **Multi-provider LLM**: 6 providers with unified interface
3. **URL Deduplication**: Prevents re-applying to same job
4. **AI Learning**: Responses improve over time via similarity matching
5. **Modular**: Each layer independent and testable

---

## 📚 File Registry

| File | Version | Purpose |
|------|---------|---------|
| PROJECT_STATE_v0.5.0.md | 0.5.0 | Progress tracker |
| CONTEXT_RESUME_v0.5.0.md | 0.5.0 | AI session resume (this file) |
| TASK_CARDS_v0.5.0.json | 0.5.0 | Task breakdown |
| CHANGELOG.md | - | Version history |
| PRD_v1.0.md | 1.0 | Product requirements |
| MODULE_1_SPEC.md | 1.0 | Technical spec |

---

*Provide this file + PROJECT_STATE at the start of any Claude session for full context.*
