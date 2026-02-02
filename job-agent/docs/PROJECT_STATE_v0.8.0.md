# Sift - Project State Document
## Version: 0.8.0 | Phase: Content Scripts VERIFIED ✅
## Last Updated: 2026-02-01

---

## 📍 Current Position

```
Planning        ✅ ████████████ 100%
Scaffolding     ✅ ████████████ 100%
Popup UI        ✅ ████████████ 100%
Storage Layer   ✅ ████████████ 100%
LLM Layer       ✅ ████████████ 100%
Background Svc  ✅ ████████████ 100%
Content Scripts ✅ ████████████ 100%  ← VERIFIED!
Options Pages      ░░░░░░░░░░░░   0%  ← NEXT
```

---

## ✅ Completed Work

### Content Scripts ✅ (VERIFIED!)

| Task | Status | Description |
|------|--------|-------------|
| CONTENT-001 | ✅ Done | Platform detection (10 ATS) |
| CONTENT-002 | ✅ Done | FormDetector with field mapping |
| CONTENT-003 | ✅ Done | AutoFiller with profile data |
| CONTENT-004 | ✅ Done | Auto-Fill Overlay UI |

**Features Verified on Lever:**
- ✅ Platform auto-detection
- ✅ Form field detection (6 fields)
- ✅ Profile key mapping (40+ patterns)
- ✅ Auto-fill on page load
- ✅ Floating overlay UI (top-right)
- ✅ Fill Form / Next buttons
- ✅ Auto-fill / Auto-next toggles
- ✅ Progress indicator
- ✅ 5/6 fields filled successfully (file input skipped - expected)

**Supported Platforms:**
Greenhouse, Lever✅, Ashby, Workday, iCIMS, SmartRecruiters, Jobvite, BambooHR, Breezy, Workable

### Previous Phases ✅
- Storage Layer: ProfileStorage, SettingsStorage, JobStorage, ResponseStorage
- LLM Layer: 6 providers (Ollama, OpenAI, Anthropic, Gemini, OpenRouter, Groq)
- Background Service: Message routing, badge counter, ATS detection

---

## 🐛 Known Issues / Backlog

| ID | Platform | Issue | Workaround | Priority |
|----|----------|-------|------------|----------|
| BUG-001 | Greenhouse | Form in iframe, not detected | Manual login first | Medium |
| BUG-002 | Ashby | React SPA loads slowly | Increase wait time | Medium |
| BUG-003 | Ollama | qwen3 returns empty text | Use different model | Low |
| BUG-004 | Ollama | CORS 403 from popup | Set OLLAMA_ORIGINS="*" | Low |

---

## 📊 Progress Metrics

| Metric | Current |
|--------|---------|
| Tasks Completed | 27/47 |
| Progress | 57% |
| Tests | ~160 passing |
| Platforms | 10 ATS (1 verified) |
| LLM Providers | 6 |

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
└── content/         ✅ VERIFIED
    ├── types.ts
    ├── platforms.ts
    ├── FormDetector.ts
    ├── AutoFiller.ts
    ├── ContentManager.ts
    ├── index.ts
    └── ui/
        └── FillOverlay.ts  ← NEW
```

---

## 🚀 Next Phase: Options Pages

Build out the full dashboard UI:
- OPTIONS-001: Profile Management (create, edit, import/export)
- OPTIONS-002: Job History and stats
- OPTIONS-003: AI Configuration
- OPTIONS-004: Settings Page

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.8.0 | 2026-02-01 | Auto-Fill Overlay verified on Lever |
| 0.7.0 | 2026-01-31 | Content Scripts complete |
| 0.6.0 | 2026-01-31 | Background Service complete |
| 0.5.0 | 2026-01-31 | LLM Layer complete |
| 0.4.0 | 2026-01-31 | Storage Layer complete |
| 0.3.0 | 2026-01-30 | Popup UI complete |
