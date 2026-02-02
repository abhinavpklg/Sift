# Sift - Context Resume Document
## Version: 0.8.2 | For: AI Development Sessions
## Last Updated: 2026-02-01

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: OPTIONS-002 Job History COMPLETE ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: OPTIONS-003 (AI Configuration Page)

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
Options Pages   ██████░░░░░░  50% ← IN PROGRESS (2/4)

Progress: 29/47 tasks (62%) | Tests: ~160 passing
```

---

## 🏗️ What's Been Built

### OPTIONS-002: Job History ✅

| Component | Purpose |
|-----------|---------|
| `JobHistoryPage.tsx` | Main page layout |
| `JobStatsCards.tsx` | 6-card stats dashboard |
| `JobFilters.tsx` | Search + filters |
| `JobTable.tsx` | Jobs list with actions |
| `useJobs.ts` | Data hook |

### Features
- Stats: Today, Week, Total Applied, Queue, Saved, Total
- Search by title/company/notes
- Filter by status (7 options) + date range
- Update status via dropdown
- Add notes (expandable rows)
- Set follow-up dates
- Export CSV/JSON
- Delete records

### OPTIONS-001: Profile Management ✅
- Full CRUD for profiles
- 6-tab form editor
- Theme toggle (dark default)

---

## 💾 Storage Keys

```
chrome.storage.local
├── sift_profiles           → UserProfile[]
├── sift_active_profile_id  → string
├── sift_applied_jobs       → AppliedJob[]
├── sift_scraped_jobs       → ScrapedJob[]
├── sift_settings           → Settings
└── sift_theme              → 'light' | 'dark'
```

---

## 📁 Key Files

```
apps/extension/src/options/
├── components/
│   ├── JobStatsCards.tsx
│   ├── JobFilters.tsx
│   ├── JobTable.tsx
│   ├── ProfileList.tsx
│   ├── ProfileForm.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   ├── useJobs.ts
│   ├── useProfiles.ts
│   └── useTheme.ts
├── pages/
│   ├── ProfilePage.tsx
│   └── JobHistoryPage.tsx
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
- PROJECT_STATE_v0.8.2.md
- CONTEXT_RESUME_v0.8.2.md

Current task: OPTIONS-003 (AI Configuration Page)

Please generate the implementation.
```

---

## 📚 File Registry

| File | Version | Purpose |
|------|---------|---------|
| PROJECT_STATE_v0.8.2.md | 0.8.2 | Progress tracker |
| CONTEXT_RESUME_v0.8.2.md | 0.8.2 | AI session resume |
| BACKLOG.md | 0.8.0 | Known issues |

---

*Provide this file + PROJECT_STATE at the start of any Claude session.*
