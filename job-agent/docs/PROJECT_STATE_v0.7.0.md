# Sift - Project State Document
## Version: 0.7.0 | Phase: Content Scripts COMPLETE
## Last Updated: 2025-01-31

---

## 📍 Current Position

```
Planning       ✅ ████████████ 100%
Scaffolding    ✅ ████████████ 100%
Popup UI       ✅ ████████████ 100%
Storage Layer  ✅ ████████████ 100%
LLM Layer      ✅ ████████████ 100%
Background Svc ✅ ████████████ 100%
Content Scripts✅ ████████████ 100%  ← JUST COMPLETED
Options Pages     ░░░░░░░░░░░░   0%  ← NEXT
```

---

## ✅ Completed Work

### Content Scripts ✅ (NEW!)

| Task | Status | Description |
|------|--------|-------------|
| CONTENT-001 | ✅ Done | Platform detection (10 ATS) |
| CONTENT-002 | ✅ Done | FormDetector with field mapping |
| CONTENT-003 | ✅ Done | AutoFiller with profile data |

**Features:**
- Platform detection: Greenhouse, Lever, Ashby, Workday, iCIMS, SmartRecruiters, Jobvite, BambooHR, Breezy, Workable
- Form field detection with 40+ profile key patterns
- Label extraction (8 strategies)
- Auto-fill with React/Vue event compatibility
- Select/radio/checkbox support
- Simulated typing option

### Previous Phases ✅
- Storage Layer: ProfileStorage, SettingsStorage, JobStorage, ResponseStorage
- LLM Layer: 6 providers (Ollama, OpenAI, Anthropic, Gemini, OpenRouter, Groq)
- Background Service: Message routing, badge counter, ATS detection

---

## 🐛 Known Issues / Backlog

| ID | Platform | Issue | Workaround | Priority |
|----|----------|-------|------------|----------|
| BUG-001 | Greenhouse | Form not detected (iframe/login required) | Manual login first | Medium |
| BUG-002 | Ashby | Form loads too slowly (React SPA) | Increase wait time or manual refresh | Medium |
| BUG-003 | Ollama | LLM generation returns empty text (qwen3 thinking mode) | Use different model or parse thinking tags | Low |
| BUG-004 | Ollama | CORS 403 errors from popup | Set OLLAMA_ORIGINS="*" env var | Low |

### BUG-001: Greenhouse Iframe
- **Symptom**: "No form found after 5 attempts" on Greenhouse jobs
- **Cause**: Application forms load inside iframe or require login
- **Fix needed**: Inject content script into iframes or detect login requirement

### BUG-002: Ashby Slow Render
- **Symptom**: "No form found" on Ashby application pages
- **Cause**: React SPA takes >2.5s to render form
- **Fix needed**: Increase wait time, use MutationObserver, or detect React hydration

### BUG-003: qwen3 Empty Response
- **Symptom**: LLM_GENERATE returns `{ text: "" }` but tokens generated
- **Cause**: qwen3 uses `<think>...</think>` tags, response is in different field
- **Fix needed**: Parse Ollama response correctly for qwen3 model format

### BUG-004: Ollama CORS
- **Symptom**: HTTP 403 Forbidden when calling Ollama from extension popup
- **Cause**: Ollama blocks cross-origin requests by default
- **Workaround**: Run `OLLAMA_ORIGINS="*" ollama serve`

---

## 📊 Progress Metrics

| Metric | Current |
|--------|---------|
| Tasks Completed | 26/47 |
| Progress | 55% |
| Tests | ~160 passing |
| Platforms | 10 ATS |
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
│   ├── types.ts
│   ├── BadgeManager.ts
│   ├── MessageHandler.ts
│   └── ServiceWorker.ts
└── content/         ✅ (NEW)
    ├── types.ts
    ├── platforms.ts
    ├── FormDetector.ts
    ├── AutoFiller.ts
    ├── ContentManager.ts
    └── index.ts
```

---

## 🚀 Next Phase: Options Pages

Build out the full dashboard UI:
- Profile management (create, edit, import/export)
- Job history and stats
- LLM configuration
- Settings management

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.7.0 | 2025-01-31 | Content Scripts complete (detection + auto-fill) |
| 0.6.0 | 2025-01-31 | Background Service complete |
| 0.5.0 | 2025-01-31 | LLM Layer complete |
| 0.4.0 | 2025-01-31 | Storage Layer complete |
| 0.3.0 | 2025-01-30 | Popup UI complete |
