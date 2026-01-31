# AI Job Agent - Quick Reference Card
## One-Page Project Summary

---

## 🎯 What We're Building

A Chrome extension that:
1. **Scrapes** job postings from 65+ ATS platforms
2. **Auto-fills** application forms using AI
3. **Learns** from user corrections over time
4. **Tracks** applications and prevents duplicates

---

## 🗂️ Documentation Map

```
docs/
├── PRD_v1.0.md              # Full product requirements
├── MODULE_1_SPEC.md         # Technical spec for current module
├── TASK_CARDS_v0.1.0.json   # Tasks to feed to Claude
├── PROJECT_STATE_v0.1.0.md  # Current progress
├── CONTEXT_RESUME_v0.1.0.md # AI session starter
├── QUICK_REFERENCE.md       # This file
└── CHANGELOG.md             # Version history
```

---

## 📊 Current Status at a Glance

| Metric | Value |
|--------|-------|
| **Phase** | Scaffolding (next) |
| **Tasks Total** | 47 |
| **Tasks Done** | 0 |
| **Code Written** | 0% |

---

## 🔧 Tech Stack Quick Reference

| What | Tech |
|------|------|
| Extension | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Storage | Chrome Storage API |
| LLM (Local) | Ollama + Llama 3.2 8B |
| Monorepo | Turborepo + pnpm |
| Tests | Vitest |

---

## 📁 Target Folder Structure

```
job-agent/
├── apps/extension/          # Chrome extension
│   ├── src/popup/          # Popup UI
│   ├── src/content/        # Page injection
│   ├── src/background/     # Service worker
│   └── src/options/        # Settings page
└── packages/shared-types/   # Shared TypeScript
```

---

## 🏃 Development Flow

```
1. Pick task from TASK_CARDS.json
2. Generate code with Claude
3. Implement & test
4. Verify acceptance criteria
5. Commit with task ID
6. Update PROJECT_STATE.md
7. Repeat
```

---

## 🚀 Essential Commands

```bash
# Setup
pnpm install

# Dev mode (hot reload)
pnpm --filter extension dev

# Build
pnpm --filter extension build

# Test
pnpm --filter extension test

# Load extension in Chrome
chrome://extensions → Developer mode → Load unpacked → dist/
```

---

## 🤖 Ollama Quick Start

```bash
# Install
brew install ollama

# Pull model
ollama pull llama3.2:8b-instruct-q4_K_M

# Start server
ollama serve

# Test
curl http://localhost:11434/api/generate -d '{"model":"llama3.2:8b-instruct-q4_K_M","prompt":"Hello"}'
```

---

## 📋 MVP ATS Priority

1. 🟢 Greenhouse (tech standard)
2. 🟢 Lever (startups)
3. 🟢 Ashby (growing)
4. 🟡 SmartRecruiters
5. 🟡 Workday (enterprise)
6. 🟡 iCIMS (enterprise)

---

## 🔄 Resume Development Prompt

```
I'm continuing AI Job Agent development.

Context files attached:
- PROJECT_STATE_v[X].md
- TASK_CARDS_v[X].json

Current task: [TASK-ID]

Please generate the implementation.
```

---

## ⚡ Key Architecture Points

1. **Local-first**: Works offline, no account required
2. **Privacy**: LLM runs locally via Ollama
3. **Learning**: Stores responses, improves over time
4. **Modular**: Each component independently testable

---

## 🎓 Versioning

| Version | Meaning |
|---------|---------|
| 0.1.x | Planning |
| 0.2.x | Scaffolding |
| 0.3-0.9.x | Module 1 features |
| 1.0.0 | MVP complete |

---

## 📞 Commit Convention

```
[TASK-ID] Brief description

Example:
[SCAFFOLD-001] Initialize monorepo with Turborepo
[POPUP-002] Add stats component with daily counter
```

---

*Print this page and keep it handy during development!*
