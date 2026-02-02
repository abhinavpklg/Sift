# Sift - Context Resume Document
## Version: 0.8.4 | For: AI Development Sessions
## Last Updated: 2026-02-01

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: PHASE-7 OPTIONS PAGES COMPLETE ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: PHASE-8 Testing & Polish (or bug fixes)

---

## 📊 Progress Overview

```
Planning        ████████████ 100% ✅
Scaffolding     ████████████ 100% ✅
Popup UI        ████████████ 100% ✅
Storage Layer   ████████████ 100% ✅
LLM Layer       ████████████ 100% ✅
Background      ████████████ 100% ✅
Content Scripts ████████████ 100% ✅
Options Pages   ████████████ 100% ✅ COMPLETE!

Progress: 31/47 tasks (66%)
```

---

## 🏗️ What's Been Built

### All Options Pages Complete ✅

| Page | Features |
|------|----------|
| Profile Management | CRUD, 6-tab form, import/export |
| Job History | Stats, filters, table, CSV export |
| AI Configuration | 6 providers, custom providers, test connection |
| Settings | General, scraping, platforms list, danger zone |

---

## 💾 Storage Keys

```
chrome.storage.local
├── sift_profiles           → UserProfile[]
├── sift_active_profile_id  → string
├── sift_applied_jobs       → AppliedJob[]
├── sift_scraped_jobs       → ScrapedJob[]
├── sift_settings           → Settings
│   ├── general
│   ├── scraping
│   ├── llm
│   ├── credentials
│   └── customProviders
└── sift_theme              → 'light' | 'dark'
```

---

## 📁 Key Files

```
apps/extension/src/options/
├── components/
│   ├── ProviderCard.tsx
│   ├── CustomProviderModal.tsx
│   ├── JobStatsCards.tsx
│   ├── JobFilters.tsx
│   ├── JobTable.tsx
│   ├── ProfileList.tsx
│   ├── ProfileForm.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   ├── useAIConfig.ts
│   ├── useJobs.ts
│   ├── useProfiles.ts
│   ├── useSettings.ts
│   └── useTheme.ts
├── pages/
│   ├── AIConfigPage.tsx
│   ├── JobHistoryPage.tsx
│   ├── ProfilePage.tsx
│   └── SettingsPage.tsx
└── App.tsx
```

---

## 🐛 Known Bugs

| ID | Issue | Priority |
|----|-------|----------|
| BUG-001 | Greenhouse form in iframe | Medium |
| BUG-002 | Ashby React SPA slow | Medium |
| BUG-003 | Ollama qwen3 empty response | Low |
| BUG-004 | Ollama CORS 403 from popup | Low |

---

## 🔧 Quick Commands

```bash
pnpm --filter extension dev    # Development
pnpm --filter extension build  # Build
pnpm --filter extension test   # Tests
```

---

## 💬 Prompt to Resume

```
I'm continuing Sift development.

Context files:
- docs/PROJECT_STATE_v0.8.4.md
- docs/CONTEXT_RESUME_v0.8.4.md

Options Pages are complete. Ready for:
- Bug fixes (BUG-001 to BUG-004)
- Testing & Polish
- Or other tasks

What would you like to work on?
```

---

*Provide this file + PROJECT_STATE at the start of any Claude session.*
