# Sift - Context Resume Document
## Version: 0.8.3 | For: AI Development Sessions
## Last Updated: 2026-02-01

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: OPTIONS-003 AI Configuration COMPLETE ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: OPTIONS-004 (Settings Page)

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
Options Pages   █████████░░░  75% ← IN PROGRESS (3/4)

Progress: 30/47 tasks (64%)
```

---

## 🏗️ What's Been Built

### OPTIONS-003: AI Configuration ✅

| Component | Purpose |
|-----------|---------|
| `AIConfigPage.tsx` | Main config page |
| `ProviderCard.tsx` | Provider selection UI |
| `CustomProviderModal.tsx` | Add/edit custom providers |
| `useAIConfig.ts` | Config management hook |

### Features
- 6 built-in providers + custom providers
- API key management (secure)
- Model selection
- Test connection
- Advanced settings (tokens, temp, timeout)

### Previous Options Pages ✅
- OPTIONS-001: Profile Management
- OPTIONS-002: Job History

---

## 💾 Storage Keys

```
chrome.storage.local
├── sift_profiles           → UserProfile[]
├── sift_active_profile_id  → string
├── sift_applied_jobs       → AppliedJob[]
├── sift_scraped_jobs       → ScrapedJob[]
├── sift_settings           → Settings (includes LLM config)
│   ├── general
│   ├── scraping
│   ├── llm
│   ├── credentials
│   └── customProviders     → CustomProvider[]
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
│   └── useTheme.ts
├── pages/
│   ├── AIConfigPage.tsx
│   ├── JobHistoryPage.tsx
│   └── ProfilePage.tsx
└── App.tsx
```

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
- docs/PROJECT_STATE_v0.8.3.md
- docs/CONTEXT_RESUME_v0.8.3.md

Current task: OPTIONS-004 (Settings Page)

Please generate the implementation.
```

---

*Provide this file + PROJECT_STATE at the start of any Claude session.*
