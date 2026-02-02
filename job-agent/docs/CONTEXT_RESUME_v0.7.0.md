# Sift - Context Resume Document
## Version: 0.7.0 | For: AI Development Sessions
## Last Updated: 2025-01-31

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: Content Scripts COMPLETE ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: Options Pages or fix backlog items

---

## 📊 Progress Overview

```
Planning       ████████████ 100% ✅
Scaffolding    ████████████ 100% ✅
Popup UI       ████████████ 100% ✅
Storage Layer  ████████████ 100% ✅
LLM Layer      ████████████ 100% ✅
Background     ████████████ 100% ✅
Content Scripts████████████ 100% ✅ ← JUST COMPLETED
Options Pages  ░░░░░░░░░░░░   0% ← NEXT

Progress: 26/47 tasks (55%) | Tests: ~160 passing
```

---

## 🏗️ What's Been Built

### Content Scripts (`content/`)

| Component | Purpose |
|-----------|---------|
| `types.ts` | Types for forms, fields, platforms |
| `platforms.ts` | ATS detection (10 platforms) |
| `FormDetector.ts` | Field detection + profile mapping |
| `AutoFiller.ts` | Fill forms with profile data |
| `ContentManager.ts` | Lifecycle + messaging |
| `index.ts` | Entry point + debug API |

**Supported Platforms:**
Greenhouse, Lever, Ashby, Workday, iCIMS, SmartRecruiters, Jobvite, BambooHR, Breezy, Workable

---

## 💻 Testing Auto-Fill

### On a Lever Application Page:

```javascript
// Fill all fields
window.__sift.fill()

// Fill required fields only
window.__sift.fillRequired()

// Get detected form
window.__sift.getForm()

// Get all detected fields
window.__sift.getFields()

// Re-detect form (after page changes)
window.__sift.refresh()
```

---

## 🐛 Known Issues / Backlog

| ID | Issue | Priority |
|----|-------|----------|
| BUG-001 | Greenhouse: form in iframe, not detected | Medium |
| BUG-002 | Ashby: React SPA loads slowly, form not found | Medium |
| BUG-003 | qwen3: LLM returns empty text (thinking mode) | Low |
| BUG-004 | Ollama: CORS 403 from popup (needs env var) | Low |

**Working Platforms:** Lever ✅ (tested and confirmed)

---

## 📁 Project Structure

```
apps/extension/src/
├── popup/           ✅
├── options/         ✅ (shell)
├── shared/
│   ├── types/       ✅
│   ├── storage/     ✅
│   └── llm/         ✅
├── background/      ✅
└── content/         ✅ (NEW)
    ├── types.ts
    ├── platforms.ts
    ├── FormDetector.ts
    ├── AutoFiller.ts
    ├── ContentManager.ts
    └── index.ts
```

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
- PROJECT_STATE_v0.7.0.md
- CONTEXT_RESUME_v0.7.0.md

Current task: [OPTIONS-001 or BUG-001]

Please generate the implementation with:
1. All required files
2. TypeScript types
3. Unit tests
4. Verification steps
```

---

## 📚 File Registry

| File | Version | Purpose |
|------|---------|---------|
| PROJECT_STATE_v0.7.0.md | 0.7.0 | Progress tracker |
| CONTEXT_RESUME_v0.7.0.md | 0.7.0 | AI session resume |
| TASK_CARDS_v0.7.0.json | 0.7.0 | Task breakdown |
| BACKLOG.md | 0.7.0 | Known issues |
| CHANGELOG.md | - | Version history |

---

*Provide this file + PROJECT_STATE at the start of any Claude session for full context.*
