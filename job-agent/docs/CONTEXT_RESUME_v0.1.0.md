# Sift - Context Resume Document
## Version: 0.3.0 | For: AI Development Sessions
## Last Updated: 2025-01-30

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: Popup UI complete, ready for Storage Layer

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: Execute task `STORAGE-001` from TASK_CARDS.json

---

## 📋 How to Use This Document

When starting a new Claude session:

1. **Provide these files** (in order):
   ```
   1. CONTEXT_RESUME.md (this file)
   2. PROJECT_STATE_v[X.X.X].md
   3. TASK_CARDS_v[X.X.X].json
   4. [Optional] Relevant code files if debugging
   ```

2. **State your intent**:
   ```
   "Continue development. Current task: [TASK-ID]"
   ```

3. **Claude will**:
   - Understand the full project context
   - Know what's been completed
   - Generate code for the specific task
   - Provide verification steps

---

## 🏗️ Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     Chrome Extension (Sift)                      │
├─────────────────────────────────────────────────────────────────┤
│  Popup UI ✅       │  Content Scripts    │  Background Worker   │
│  - Stats           │  - Form detection   │  - Message routing   │
│  - Profile switch  │  - Auto-fill        │  - Badge counter     │
│  - Quick actions   │  - Generate UI      │  - Tab monitoring    │
├─────────────────────────────────────────────────────────────────┤
│                     Storage Layer (NEXT)                         │
│  ProfileStorage │ SettingsStorage │ JobStorage │ ResponseStorage │
├─────────────────────────────────────────────────────────────────┤
│                         LLM Layer                                │
│     OllamaClient (local) ←→ LLMRouter ←→ OpenAIClient (cloud)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Extension | React + TypeScript + Vite | Modern, fast builds |
| Styling | Tailwind CSS | Utility-first, small bundle |
| Storage | Chrome Storage API | Built-in, secure |
| LLM (Local) | Ollama + Llama 3.2 8B | M1 optimized |
| LLM (Cloud) | OpenAI API (optional) | Fallback |
| Monorepo | Turborepo + pnpm | Fast, efficient |
| Testing | Vitest | Fast, Vite-native |

---

## 📁 Project Structure (Target)

```
job-agent/
├── apps/
│   └── extension/          # Chrome Extension
│       ├── public/
│       │   ├── manifest.json
│       │   └── icons/
│       └── src/
│           ├── popup/      # Extension popup
│           ├── content/    # Content scripts
│           ├── background/ # Service worker
│           ├── options/    # Full-page options
│           └── shared/     # Shared utilities
│               ├── types/
│               ├── storage/
│               └── llm/
├── packages/
│   └── shared-types/       # Shared TypeScript types
├── docs/                   # Documentation
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 📝 Key Design Decisions

### 1. Storage Strategy
- **Local-first**: Works without any account
- **Optional sync**: Google OAuth for cross-device sync
- **Privacy**: Sensitive data encrypted locally

### 2. LLM Strategy
- **Primary**: Local Ollama (privacy, free)
- **Fallback**: Cloud APIs (OpenAI/Anthropic)
- **Model**: Llama 3.2 8B Instruct (Q4_K_M quantization)

### 3. ATS Priority
MVP scrapers (in order):
1. Greenhouse (most common)
2. Lever (startups)
3. Ashby (growing)
4. SmartRecruiters (mid-market)
5. Workday (enterprise)
6. iCIMS (enterprise)

### 4. Form Filling Strategy
```
1. Detect form fields (labels, types)
2. Match to profile fields (rules → LLM fallback)
3. Fill using type-specific strategies
4. Inject "Generate" button for long text
5. Save responses for learning
```

---

## 🚧 Current Development Phase

### Phase: Storage Layer
**Status**: Starting
**Target**: Persistent data management for profiles, settings, jobs

### Immediate Tasks (Next Session)
1. `STORAGE-001`: Implement ProfileStorage class
2. `STORAGE-002`: Implement SettingsStorage class  
3. `STORAGE-003`: Implement JobStorage class
4. `STORAGE-004`: Implement ResponseStorage class

### Success Criteria
- [ ] Profile CRUD operations work
- [ ] Settings persist across sessions
- [ ] Applied jobs tracked with URL deduplication
- [ ] Saved responses stored for learning

---

## ✅ Completed Phases

| Phase | Status | Key Outputs |
|-------|--------|-------------|
| Planning | ✅ | PRD, Module specs, Task cards |
| Scaffolding | ✅ | Monorepo, Vite, Manifest V3 |
| Popup UI | ✅ | Stats, profile switcher, actions |

---

## 🔍 Useful Commands

```bash
# Install dependencies
pnpm install

# Development mode
pnpm --filter extension dev

# Build extension
pnpm --filter extension build

# Run tests
pnpm --filter extension test

# Type check
pnpm --filter extension typecheck

# Load in Chrome
# 1. Go to chrome://extensions
# 2. Enable Developer mode
# 3. Load unpacked → select apps/extension/dist
```

---

## 📚 Reference Links

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Vite + Chrome Extension](https://crxjs.dev/vite-plugin/)
- [Ollama API Docs](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ⚠️ Known Constraints

1. **Manifest V3 Limitations**:
   - Service workers can be terminated
   - No persistent background scripts
   - Must use chrome.alarms for scheduling

2. **Storage Limits**:
   - Local: 10MB
   - Sync: 100KB (102,400 bytes)
   - Use local for profiles, sync for settings

3. **Content Script Isolation**:
   - Runs in isolated world
   - Must use messaging for background communication

---

## 🧪 Testing Strategy

| Type | Tool | Focus |
|------|------|-------|
| Unit | Vitest | Storage, LLM client |
| Integration | Vitest | Message passing |
| E2E | Manual | Full form filling flow |

---

## 📊 Progress Tracking

Update after each session:

| Date | Tasks Completed | Notes |
|------|-----------------|-------|
| 2025-01-30 | Planning | PRD, specs, task cards created |

---

## 🔄 Version History

| Version | Date | Phase | Key Changes |
|---------|------|-------|-------------|
| 0.1.0 | 2025-01-30 | Planning | Initial documentation |

---

## 💬 Prompt Templates for Claude

### Starting a Task
```
I'm continuing development on the AI Job Agent Chrome extension.

Here's my current context:
- [Paste PROJECT_STATE.md summary]
- Current task: [TASK-ID] - [Title]

Please generate the code for this task following the specifications 
in TASK_CARDS.json. Include:
1. All required files
2. Verification steps
3. Any tests needed
```

### Debugging
```
I'm working on [TASK-ID] and encountered an error:

Error: [paste error]

Context:
- File: [filename]
- What I was trying to do: [action]
- Relevant code: [paste code]

Please help me fix this while maintaining consistency with the project architecture.
```

### Reviewing Code
```
Please review this implementation for [TASK-ID]:

[paste code]

Check for:
1. Consistency with project patterns
2. TypeScript best practices
3. Error handling
4. Edge cases
```

---

*This document should be provided at the start of every Claude session for project continuity.*
