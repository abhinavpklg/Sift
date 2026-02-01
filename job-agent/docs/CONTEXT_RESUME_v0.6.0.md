# Sift - Context Resume Document
## Version: 0.6.0 | For: AI Development Sessions
## Last Updated: 2025-01-31

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: Background Service COMPLETE ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: Content Scripts (CONTENT-001)

---

## 📊 Progress Overview

```
Planning       ████████████ 100% ✅
Scaffolding    ████████████ 100% ✅
Popup UI       ████████████ 100% ✅
Storage Layer  ████████████ 100% ✅
LLM Layer      ████████████ 100% ✅
Background     ████████████ 100% ✅ ← JUST COMPLETED
Content Scripts░░░░░░░░░░░░   0% ← NEXT

Progress: 23/47 tasks (49%) | Tests: ~115 passing
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
| `LLMRouter` | Unified interface + fallback |
| `OllamaClient` | Local Ollama (free) |
| `OpenAIClient` | GPT-4/3.5 |
| `AnthropicClient` | Claude 3.5 |
| `GeminiClient` | Google AI (free tier) |
| `OpenRouterClient` | Multi-model (free tier) |
| `GroqClient` | Ultra-fast (free tier) |

### Background Service (`background/`) - NEW!

| Component | Purpose |
|-----------|---------|
| `types.ts` | 30+ message type definitions |
| `BadgeManager.ts` | Badge counter with color progress |
| `MessageHandler.ts` | Routes messages to storage/LLM |
| `ServiceWorker.ts` | Main service worker entry |

---

## 💻 Code Examples

### Sending Messages (from Popup/Content)

```typescript
// From popup or content script
const response = await chrome.runtime.sendMessage({
  type: 'GET_ACTIVE_PROFILE',
});
console.log(response.data); // UserProfile

// Mark job as applied
await chrome.runtime.sendMessage({
  type: 'MARK_JOB_APPLIED',
  payload: {
    profileId: 'profile-123',
    url: 'https://jobs.lever.co/company/123',
    title: 'Software Engineer',
    company: 'Acme Inc',
  },
});

// Generate with LLM
const result = await chrome.runtime.sendMessage({
  type: 'LLM_GENERATE',
  payload: {
    prompt: 'Why do you want to work here?',
    systemPrompt: 'You are helping fill job applications.',
    maxTokens: 500,
  },
});
console.log(result.data.text);

// Check LLM connection
const status = await chrome.runtime.sendMessage({
  type: 'LLM_CHECK_CONNECTION',
});
console.log(status.data.connected ? '✅ Connected' : '❌ Disconnected');
```

### Message Types Available

```typescript
// Profile
'GET_PROFILES' | 'GET_ACTIVE_PROFILE' | 'SET_ACTIVE_PROFILE' |
'CREATE_PROFILE' | 'UPDATE_PROFILE' | 'DELETE_PROFILE'

// Settings
'GET_SETTINGS' | 'UPDATE_SETTINGS' | 'GET_LLM_CONFIG' | 'SET_LLM_PROVIDER'

// Jobs
'GET_JOBS' | 'ADD_JOB' | 'MARK_JOB_APPLIED' | 'IS_URL_APPLIED' | 'GET_JOB_STATS'

// Responses
'SAVE_RESPONSE' | 'FIND_SIMILAR_RESPONSES' | 'GET_BEST_RESPONSE'

// LLM
'LLM_GENERATE' | 'LLM_CHECK_CONNECTION' | 'LLM_GENERATE_FORM_RESPONSE' |
'LLM_MATCH_FIELD' | 'LLM_SUMMARIZE_JOB'

// Badge
'UPDATE_BADGE' | 'GET_TODAY_COUNT'

// Content Script
'CONTENT_READY' | 'FORM_DETECTED' | 'FILL_FORM' | 'FORM_FILLED'
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
│       │   ├── types/       ✅
│       │   ├── storage/     ✅
│       │   └── llm/         ✅
│       ├── background/      ✅ Complete (NEW)
│       │   ├── types.ts
│       │   ├── BadgeManager.ts
│       │   ├── MessageHandler.ts
│       │   ├── ServiceWorker.ts
│       │   └── index.ts
│       └── content/         🔄 Next
├── docs/
│   ├── PROJECT_STATE_v0.6.0.md
│   ├── CONTEXT_RESUME_v0.6.0.md (this file)
│   └── TASK_CARDS_v0.6.0.json
└── CHANGELOG.md
```

---

## 🚀 Next Phase: Content Scripts

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
# Development
pnpm --filter extension dev

# Build
pnpm build

# Run tests
pnpm --filter extension test

# Load in Chrome
chrome://extensions → Developer mode → Load unpacked → dist/
```

---

## 💬 Prompt to Resume Development

```
I'm continuing Sift development.

Context files:
- PROJECT_STATE_v0.6.0.md
- CONTEXT_RESUME_v0.6.0.md

Current task: CONTENT-001

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
4. **AI Learning**: Responses improve over time
5. **Message-based**: Clean separation between components
6. **Badge Progress**: Visual feedback on daily goal

---

## 📚 File Registry

| File | Version | Purpose |
|------|---------|---------|
| PROJECT_STATE_v0.6.0.md | 0.6.0 | Progress tracker |
| CONTEXT_RESUME_v0.6.0.md | 0.6.0 | AI session resume (this file) |
| TASK_CARDS_v0.6.0.json | 0.6.0 | Task breakdown |
| CHANGELOG.md | - | Version history |

---

*Provide this file + PROJECT_STATE at the start of any Claude session for full context.*
