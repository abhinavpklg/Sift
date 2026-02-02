# Sift - Context Resume Document
## Version: 0.8.1 | For: AI Development Sessions
## Last Updated: 2026-02-01

---

## 🎯 Quick Context (Read This First)

**Project**: Sift - AI-powered Chrome extension for automating job applications

**Tagline**: "Sift smarter. Apply faster."

**Current Status**: OPTIONS-001 Profile Management COMPLETE ✅

**Your Role**: Full-stack engineer building this step by step

**Hardware**: MacBook M1 Pro, 16GB RAM

**Next Action**: OPTIONS-002 (Job History Page)

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
Options Pages   ███░░░░░░░░░  25% ← IN PROGRESS

Progress: 28/47 tasks (60%) | Tests: ~160 passing
```

---

## 🏗️ What's Been Built

### OPTIONS-001: Profile Management ✅

| Component | Purpose |
|-----------|---------|
| `ProfilePage.tsx` | Main page layout |
| `ProfileList.tsx` | Sidebar with profile cards |
| `ProfileForm.tsx` | Tabbed editor (6 tabs) |
| `useProfiles.ts` | CRUD hook for profiles |
| `useTheme.ts` | Dark/light mode toggle |
| `ThemeToggle.tsx` | Theme switch button |

### Profile Form Tabs
1. **Personal** - Name, email, phone, address, social links
2. **Education** - Add/remove schools with degrees
3. **Work** - Add/remove jobs with technologies
4. **Skills** - Technical, soft, languages, certifications
5. **Documents** - Resume upload, cover letter template
6. **EEO** - Work authorization, demographics

### Features
- Create, edit, delete profiles
- Set active profile for auto-fill
- Duplicate / Export / Import profiles
- Completeness percentage indicator
- Dark mode default + toggle
- Responsive 3-column layout

---

## 💾 Storage Architecture

```
chrome.storage.local (~10MB limit)
├── sift_profiles          → UserProfile[]
├── sift_active_profile_id → string
├── sift_settings          → Settings
├── sift_jobs              → Job[]
└── sift_theme             → 'light' | 'dark'
```

---

## 📁 Key Files

```
apps/extension/src/options/
├── components/
│   ├── ProfileList.tsx
│   ├── ProfileForm.tsx
│   ├── ThemeToggle.tsx
│   └── forms/
│       ├── PersonalInfoForm.tsx
│       ├── EducationForm.tsx
│       ├── WorkHistoryForm.tsx
│       ├── SkillsForm.tsx
│       ├── DocumentsForm.tsx
│       └── EmploymentInfoForm.tsx
├── hooks/
│   ├── useProfiles.ts
│   └── useTheme.ts
├── pages/
│   └── ProfilePage.tsx
└── App.tsx
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
- PROJECT_STATE_v0.8.1.md
- CONTEXT_RESUME_v0.8.1.md

Current task: OPTIONS-002 (Job History Page)

Please generate the implementation with:
1. All required files
2. TypeScript types
3. Verification steps
```

---

## 📚 File Registry

| File | Version | Purpose |
|------|---------|---------|
| PROJECT_STATE_v0.8.1.md | 0.8.1 | Progress tracker |
| CONTEXT_RESUME_v0.8.1.md | 0.8.1 | AI session resume |
| BACKLOG.md | 0.8.0 | Known issues |

---

*Provide this file + PROJECT_STATE at the start of any Claude session.*
