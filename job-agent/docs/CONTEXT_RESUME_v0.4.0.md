# Sift - Context Resume Document
## Version: 0.4.0 | For: AI Development Sessions
## Last Updated: 2025-01-31

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: Storage Layer COMPLETE ✅ Ready for LLM Integration

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: Execute task `LLM-001` - OllamaClient

---

## 📋 What's Been Built

### Storage Layer (100% Complete)

| Class | Purpose | Key Methods |
|-------|---------|-------------|
| `ProfileStorage` | User profiles | getAll, create, update, delete, export, import |
| `SettingsStorage` | App settings | getAll, update, reset, setLLMProvider |
| `JobStorage` | Job tracking | addScrapedJob, markAsApplied, isUrlApplied, getStats |
| `ResponseStorage` | AI learning | save, findSimilar, findBestMatch, recordUsage |

### Using Storage (Examples)

```typescript
import { ProfileStorage, SettingsStorage, JobStorage, ResponseStorage } from './shared/storage';

// Profiles
const profile = await ProfileStorage.getActive();
await ProfileStorage.create({ name: 'Tech Jobs', personalInfo: {...} });

// Settings
const settings = await SettingsStorage.getAll();
await SettingsStorage.setLLMProvider('ollama', 'http://localhost:11434');

// Jobs
const alreadyApplied = await JobStorage.isUrlApplied(url);
await JobStorage.markAsApplied({ profileId, url, title, company, notes });
const todayCount = await JobStorage.getTodayCount();

// Responses (AI Learning)
await ResponseStorage.save(question, response);
const matches = await ResponseStorage.findSimilar(newQuestion);
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Chrome Extension (Sift)                      │
├─────────────────────────────────────────────────────────────────┤
│  Popup UI ✅       │  Content Scripts    │  Background Worker   │
│  - Stats           │  - Form detection   │  - Message routing   │
│  - Profile switch  │  - Auto-fill        │  - Badge counter     │
│  - Quick actions   │  - Generate UI      │  - Tab monitoring    │
├─────────────────────────────────────────────────────────────────┤
│                     Storage Layer ✅                             │
│  ProfileStorage │ SettingsStorage │ JobStorage │ ResponseStorage │
├─────────────────────────────────────────────────────────────────┤
│                     LLM Layer (NEXT)                            │
│     OllamaClient (local) ↔ LLMRouter ↔ OpenAIClient (cloud)    │
└─────────────────────────────────────────────────────────────────┘
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
│       ├── popup/           # ✅ Complete
│       ├── options/         # ✅ Shell complete
│       ├── background/      # Placeholder
│       ├── content/         # Placeholder
│       └── shared/
│           ├── types/       # ✅ Complete
│           │   ├── profile.ts
│           │   ├── settings.ts
│           │   ├── job.ts
│           │   ├── response.ts
│           │   └── index.ts
│           ├── storage/     # ✅ Complete
│           │   ├── ProfileStorage.ts
│           │   ├── SettingsStorage.ts
│           │   ├── JobStorage.ts
│           │   ├── ResponseStorage.ts
│           │   └── index.ts
│           └── llm/         # 🔄 Next
│               ├── OllamaClient.ts
│               ├── LLMRouter.ts
│               └── prompts.ts
├── packages/shared-types/
├── docs/
└── package.json
```

---

## 🚀 Next Phase: LLM Integration

### Tasks

| ID | Title | Priority | Est. Time |
|----|-------|----------|-----------|
| LLM-001 | OllamaClient | Critical | 60 min |
| LLM-002 | LLMRouter | High | 45 min |
| LLM-003 | Prompt Templates | High | 45 min |
| LLM-004 | OpenAI Client | Low | 45 min |

### LLM-001 Requirements

```typescript
// OllamaClient should implement:
class OllamaClient {
  checkHealth(): Promise<boolean>
  listModels(): Promise<string[]>
  generate(prompt: string, system?: string): Promise<GenerateResponse>
  matchFieldToProfile(label: string, type: string, keys: string[]): Promise<string | null>
  generateResponse(question: string, context: string): Promise<string>
}
```

---

## 🔧 Tech Stack

| Component | Technology |
|-----------|------------|
| Extension | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Storage | Chrome Storage API |
| LLM (Local) | Ollama + Llama 3.2 8B |
| LLM (Cloud) | OpenAI API (optional) |
| Monorepo | Turborepo + pnpm |
| Testing | Vitest |

---

## 💬 Prompt Template

```
I'm continuing Sift development.

Context files:
- PROJECT_STATE_v0.4.0.md
- CONTEXT_RESUME_v0.4.0.md

Current task: LLM-001 - OllamaClient

Please generate the implementation with:
1. All required files
2. TypeScript types
3. Unit tests
4. Verification steps
```

---

## ⚡ Quick Commands

```bash
pnpm install          # Install deps
pnpm build            # Build all
pnpm --filter extension dev    # Dev mode
pnpm --filter extension test   # Run tests
```

---

*This document + PROJECT_STATE provides full context for any AI session.*
