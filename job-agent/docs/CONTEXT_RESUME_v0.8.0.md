# Sift - Context Resume Document
## Version: 0.8.0 | For: AI Development Sessions
## Last Updated: 2026-02-01

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: Content Scripts + Auto-Fill VERIFIED ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: OPTIONS-001 (Profile Management UI)

---

## 📊 Progress Overview

```
Planning        ████████████ 100% ✅
Scaffolding     ████████████ 100% ✅
Popup UI        ████████████ 100% ✅
Storage Layer   ████████████ 100% ✅
LLM Layer       ████████████ 100% ✅
Background      ████████████ 100% ✅
Content Scripts ████████████ 100% ✅ ← VERIFIED!
Options Pages   ░░░░░░░░░░░░   0% ← NEXT

Progress: 27/47 tasks (57%) | Tests: ~160 passing
```

---

## 🏗️ What's Been Built

### Auto-Fill System (content/)

| Component | Purpose |
|-----------|---------|
| `platforms.ts` | ATS detection (10 platforms) |
| `FormDetector.ts` | Field detection + profile mapping |
| `AutoFiller.ts` | Fill forms with profile data |
| `ContentManager.ts` | Lifecycle + messaging |
| `ui/FillOverlay.ts` | Floating overlay UI |
| `index.ts` | Entry point + auto-fill flow |

### Overlay UI Features
- Shows in top-right corner on ATS pages
- Auto-detects form → Auto-fills → Shows progress
- "Fill Form" button for manual trigger
- "Next" button for multi-page forms
- Auto-fill / Auto-next toggles
- Draggable position

---

## 💻 Testing

### Verified on Lever:
```
https://jobs.lever.co/agile-defense/67d93c39-86d1-4c8e-96ea-eea7ddbae660/apply

Result: 5/6 fields filled (file input skipped - expected)
```

### Storage Keys:
- `sift_profiles` - Array of UserProfile
- `sift_active_profile_id` - Current profile ID

---

## 🐛 Known Issues

| ID | Issue | Priority |
|----|-------|----------|
| BUG-001 | Greenhouse: form in iframe | Medium |
| BUG-002 | Ashby: slow React render | Medium |
| BUG-003 | qwen3: empty response | Low |
| BUG-004 | Ollama: CORS 403 | Low |

---

## 📁 Key Files

```
apps/extension/
├── public/
│   └── content.css      ← Overlay styles
├── src/
│   ├── content/
│   │   ├── ui/FillOverlay.ts
│   │   ├── AutoFiller.ts
│   │   ├── FormDetector.ts
│   │   └── index.ts
│   ├── shared/storage/
│   │   └── ProfileStorage.ts
│   └── background/
│       └── MessageHandler.ts
```

---

## 🔧 Quick Commands

```bash
# Development
pnpm --filter extension dev

# Build
pnpm --filter extension build

# Run tests
pnpm --filter extension test

# Load in Chrome
chrome://extensions → Developer mode → Load unpacked → dist/
```

---

## 💬 Prompt to Resume

```
I'm continuing Sift development.

Context files:
- PROJECT_STATE_v0.8.0.md
- CONTEXT_RESUME_v0.8.0.md

Current task: OPTIONS-001 (Profile Management UI)

Please generate the implementation with:
1. All required files
2. TypeScript types
3. Verification steps
```

---

## 📚 File Registry

| File | Version | Purpose |
|------|---------|---------|
| PROJECT_STATE_v0.8.0.md | 0.8.0 | Progress tracker |
| CONTEXT_RESUME_v0.8.0.md | 0.8.0 | AI session resume |
| BACKLOG.md | 0.8.0 | Known issues |

---

*Provide this file + PROJECT_STATE at the start of any Claude session.*
