# Sift - Backlog & Known Issues
## Last Updated: 2026-02-01 (v0.8.0)

---

## 🐛 Bugs

### BUG-001: Greenhouse Form Not Detected
- **Status**: Open
- **Priority**: Medium
- **Platform**: Greenhouse
- **Symptom**: "No form found after 5 attempts"
- **Cause**: Forms load inside iframe or require login
- **Proposed Fix**: Detect iframes, inject content script

### BUG-002: Ashby Form Loads Slowly
- **Status**: Open
- **Priority**: Medium
- **Platform**: Ashby
- **Symptom**: "No form found" on /application pages
- **Cause**: React SPA takes >5s to render
- **Proposed Fix**: Increase wait time, use MutationObserver

### BUG-003: qwen3 Empty Response
- **Status**: Open
- **Priority**: Low
- **Platform**: Ollama (qwen3)
- **Symptom**: LLM_GENERATE returns empty text
- **Cause**: qwen3 uses <think> tags
- **Workaround**: Use llama3.2 or other model

### BUG-004: Ollama CORS
- **Status**: Workaround Available
- **Priority**: Low
- **Platform**: Ollama
- **Symptom**: HTTP 403 from extension
- **Workaround**: Run `OLLAMA_ORIGINS="*" ollama serve`

---

## 🔧 Improvements

### IMP-001: Greenhouse iframe handling
- **Priority**: High
- **Description**: Inject content script into iframes

### IMP-002: Ashby longer detection
- **Priority**: High
- **Description**: Wait longer for React hydration

### IMP-003: Profile completeness check
- **Priority**: Medium
- **Description**: Warn if profile missing required fields

### IMP-004: Undo fill
- **Priority**: Low
- **Description**: Save previous values, allow undo

---

## ✅ Resolved

| ID | Issue | Resolution | Date |
|----|-------|------------|------|
| - | Storage key mismatch | Fixed keys to sift_profiles | 2026-02-01 |
| - | CSP inline script error | Moved to external CSS | 2026-02-01 |
| - | window.__sift not accessible | Using overlay UI instead | 2026-02-01 |

---
