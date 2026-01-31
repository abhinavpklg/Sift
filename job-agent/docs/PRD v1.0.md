# Product Requirements Document (PRD)
## AI-Powered Job Application Browser Agent
### Version 1.0 | January 2025

---

## 1. Executive Summary

### 1.1 Product Vision
Build a modular, AI-powered Chrome extension and dashboard system that automates job discovery, application form filling, and application tracking. The system leverages locally-hosted LLMs (via Ollama) or cloud LLM APIs to intelligently fill applications and learn from user inputs over time.

### 1.2 Key Value Propositions
- **Automated Job Discovery**: Boolean search across ATS platforms with configurable filters
- **Intelligent Auto-Fill**: AI-powered form completion using user profiles and learned responses
- **Privacy-First**: Local LLM support ensures sensitive data stays on user's machine
- **Continuous Learning**: System improves responses based on user corrections
- **Multi-Profile Support**: Manage different job search personas from one account

### 1.3 Target Users
- Active job seekers applying to multiple positions daily
- Career changers managing applications across different industries
- Technical professionals seeking automation in repetitive tasks

### 1.4 Distribution Strategy
| Phase | Environment | Target |
|-------|-------------|--------|
| Alpha | Developer mode (unpacked) | Personal use, testing |
| Beta | Unlisted Chrome Web Store | Invite-only testers |
| Public | Chrome Web Store | General availability |

### 1.5 Authentication Model
- **Without Login**: Full functionality with local-only storage
- **With Google Login**: Optional cloud sync across devices
- User explicitly chooses their preference during onboarding

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                                │
├──────────────────────────────┬──────────────────────────────────────┤
│     Chrome Extension         │         Web Dashboard                 │
│  - Popup UI (React)          │  - Profile Management                 │
│  - Content Scripts           │  - Job Queue/History                  │
│  - Background Service Worker │  - Settings & Config                  │
│  - Badge Counter             │  - Analytics                          │
└──────────────────────────────┴──────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                     Node.js/Express API Server                       │
│  - Authentication (Google OAuth + JWT)                               │
│  - Profile CRUD Operations                                           │
│  - Job Queue Management                                              │
│  - Scraping Orchestration                                            │
│  - Response Learning Engine                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│    LLM LAYER          │ │   DATABASE      │ │   SCRAPING ENGINE   │
├───────────────────────┤ ├─────────────────┤ ├─────────────────────┤
│ - Ollama (Local)      │ │ - PostgreSQL    │ │ - Puppeteer/        │
│ - OpenAI API          │ │ - Redis Cache   │ │   Playwright        │
│ - Anthropic API       │ │ - Vector DB     │ │ - Rate Limiting     │
│ - Custom Endpoints    │ │   (pgvector)    │ │ - Human Mimicking   │
└───────────────────────┘ └─────────────────┘ └─────────────────────┘
```

---

## 3. Module Breakdown

### Module 1: Chrome Extension Core
**Priority: P0 (Critical)**

#### 1.1 Extension Popup UI
- Daily application counter with configurable goal
- Quick status indicators (scraping active, LLM connected)
- Profile switcher dropdown
- Start/Stop scraping toggle
- Settings shortcut

#### 1.2 Content Scripts
- DOM detection for job application forms
- Field identification and classification
- Auto-fill injection system
- "Generate" button injection for long-text fields
- Applied status detection and notification

#### 1.3 Background Service Worker
- Message routing between popup, content scripts, and backend
- Tab monitoring for job URLs
- Notification system for duplicate applications
- Badge counter updates

#### 1.4 Storage Layer
- Chrome Storage API for local preferences
- Sync storage for cross-device settings
- IndexedDB for offline capability

### Module 2: Web Dashboard
**Priority: P0 (Critical)**

#### 2.1 Authentication System
- Google OAuth 2.0 integration
- JWT session management
- Cross-device sync capability
- Account linking with extension

#### 2.2 Profile Management Section
| Sub-section | Fields |
|-------------|--------|
| Personal Info | Name, Email, Phone, Address, LinkedIn URL, Portfolio/Website |
| Education | Degree, Institution, GPA, Graduation Date, Certifications |
| Work History | Company, Title, Duration, Description, Technologies Used |
| Skills | Technical Skills, Soft Skills, Proficiency Levels |
| Documents | Resume Upload (PDF), Cover Letter Templates |
| Employment Info | Work Authorization, Visa Sponsorship, Disability, Veteran Status, Age Range, Gender, Ethnicity |
| Saved Responses | Keyword-Response pairs from past applications |

#### 2.3 Multi-Profile Support
- Create/Edit/Delete profiles
- Profile cloning
- Active profile selection
- Profile-specific resume attachments

#### 2.4 Import/Export
- JSON export of complete profile
- JSON import with validation
- Resume export/import

### Module 3: Job Discovery Engine
**Priority: P0 (Critical)**

#### 3.1 Boolean Search Configuration
```
Default Pattern: "{job_title}" site:{ats_domain}
Example: "Full Stack Engineer" site:greenhouse.io
```

#### 3.2 Supported ATS Platforms (65 Total)

**Enterprise (9 platforms)**
| Platform | Domain Pattern | Priority |
|----------|---------------|----------|
| Workday Recruiting | myworkdayjobs.com, wd5.myworkdaysite.com | P0 |
| Oracle Taleo | taleo.net | P1 |
| SAP SuccessFactors | successfactors.com | P1 |
| iCIMS | icims.com | P0 |
| BrassRing | brassring.com | P2 |
| Cornerstone OnDemand | cornerstoneondemand.com | P2 |
| ADP Recruiting | adp.com | P2 |
| Ceridian Dayforce | ceridian.com | P2 |
| UKG Pro/Ready | ukg.com | P2 |

**Mid-Market (16 platforms)** - Highest Priority for Tech Jobs
| Platform | Domain Pattern | Priority |
|----------|---------------|----------|
| Greenhouse | greenhouse.io, boards.greenhouse.io | P0 |
| Lever | lever.co, jobs.lever.co | P0 |
| Ashby | ashbyhq.com, jobs.ashbyhq.com | P0 |
| SmartRecruiters | smartrecruiters.com | P0 |
| Jobvite | jobvite.com | P1 |
| JazzHR | jazzhr.com | P1 |
| BambooHR | bamboohr.com | P1 |
| Workable | workable.com | P1 |
| Recruitee | recruitee.com | P1 |
| Teamtailor | teamtailor.com | P1 |
| Pinpoint | pinpointhq.com | P2 |
| Rippling | rippling.com | P2 |
| ClearCompany | clearcompany.com | P2 |
| Paylocity | paylocity.com | P2 |
| Paycor | paycor.com | P2 |
| Breezy HR | breezy.hr | P2 |

**SMB (11 platforms)**
| Platform | Domain Pattern | Priority |
|----------|---------------|----------|
| Zoho Recruit | zoho.com/recruit | P2 |
| Freshteam | freshworks.com | P2 |
| ApplicantPro | applicantpro.com | P2 |
| Homebase | joinhomebase.com | P3 |
| Hireology | hireology.com | P3 |
| GoHire | gohire.io | P3 |
| Manatal | manatal.com | P3 |
| 100Hires | 100hires.com | P3 |
| ApplicantStack | applicantstack.com | P3 |
| Personio | personio.com | P2 |
| Dover | dover.com | P2 |

**IT/Technical Recruiting (6 platforms)**
| Platform | Focus | Priority |
|----------|-------|----------|
| Hired | Tech marketplace | P1 |
| Dice | Tech job board | P1 |
| HackerRank | Coding assessments | P2 |
| Codility | Technical assessments | P2 |
| CodeSignal | Coding evaluations | P2 |
| HackerEarth | Developer assessments | P3 |

**Staffing/Agencies (7 platforms)**
| Platform | Priority |
|----------|----------|
| Bullhorn | P2 |
| Crelate | P3 |
| JobDiva | P3 |
| Avionte | P3 |
| PCRecruiter | P3 |
| Loxo | P3 |
| Ceipal | P3 |

**AI-Powered Platforms (12 platforms)**
| Platform | Capability | Priority |
|----------|------------|----------|
| Gem | AI all-in-one recruiting | P1 |
| Fetcher | AI outbound sourcing | P2 |
| hireEZ | Agentic AI recruiting | P2 |
| Beamery | Talent lifecycle CRM | P2 |
| Phenom | Intelligent talent experience | P2 |
| Eightfold AI | Deep-learning intelligence | P2 |
| Paradox (Olivia) | Conversational AI | P2 |
| SeekOut | AI talent sourcing | P2 |
| Findem | Attribute-based sourcing | P3 |
| Textio | Inclusive JD writing | P3 |
| Harver | Pre-employment assessments | P3 |
| HireVue | Video interviewing + AI | P2 |

**MVP Scraper Priority:**
1. Greenhouse, Lever, Ashby, SmartRecruiters (most common for tech)
2. Workday, iCIMS (enterprise)
3. Remaining mid-market platforms

#### 3.3 Scraping Configuration
- **Time Filter**: Default 24 hours, configurable (1-168 hours)
- **Rate Limiting**: Configurable delay between requests (2-10 seconds)
- **Human Mimicking**: Random delays, mouse movements, scroll patterns
- **Concurrent Tabs**: Max 3 simultaneous scrapes
- **Retry Logic**: 3 attempts with exponential backoff

#### 3.4 Job Queue Table
| Column | Description |
|--------|-------------|
| Job Title | Scraped title |
| Company | Company name |
| URL | Direct link to application |
| Posted Date | "X hrs ago" / "X days ago" |
| Summary | AI-generated 2-3 sentence summary |
| Tech Stack | Extracted technologies |
| Match Score | Relevance to user profile (0-100) |
| Status | Pending / Applied / Skipped |
| Actions | Apply / Skip / Save for Later |

#### 3.5 Filtering & Sorting
- Sort by: Most Recent, Match Score, Company
- Filter by: ATS Platform, Status, Date Range

### Module 4: AI Auto-Fill System
**Priority: P0 (Critical)**

#### 4.1 Field Detection Algorithm
```
1. Identify form fields (input, textarea, select)
2. Analyze labels, placeholders, aria-labels
3. Match to profile schema using embeddings
4. Classify field type (text, date, select, radio, checkbox)
5. Apply appropriate filling strategy
```

#### 4.2 Filling Strategies
| Field Type | Strategy |
|------------|----------|
| Simple Text | Direct mapping from profile |
| Date Fields | Format detection + conversion |
| Dropdowns | Fuzzy matching options |
| Radio/Checkbox | Boolean/keyword matching |
| Long Text | LLM generation with context |
| File Upload | Inject resume from profile |

#### 4.3 Generate Button Feature
- Injected next to textarea fields > 200 chars expected
- Opens modal with:
  - Original question/prompt
  - User profile context
  - Previous similar responses
  - Generated response preview
  - Edit capability before insertion

#### 4.4 Learning System
- Store question-answer pairs after submission
- Embed questions for similarity matching
- Retrieve similar past responses for new questions
- User can edit/approve responses (feedback loop)

### Module 5: LLM Integration Layer
**Priority: P0 (Critical)**

#### 5.1 Provider Configuration
```typescript
interface LLMConfig {
  provider: 'ollama' | 'openai' | 'anthropic' | 'custom';
  endpoint: string;  // For Ollama: http://localhost:11434
  model: string;     // e.g., "llama3.2:8b-instruct"
  apiKey?: string;   // For cloud providers
  maxTokens: number;
  temperature: number;
}
```

#### 5.2 Ollama Integration
- Auto-detection of local Ollama instance
- Network Ollama support (custom IP:port)
- Model selection from available models
- Health check and status monitoring

#### 5.3 Prompt Templates
| Template | Use Case |
|----------|----------|
| field_match | Match form field to profile field |
| generate_response | Generate long-form response |
| summarize_job | Create job description summary |
| extract_skills | Extract tech stack from JD |
| relevance_score | Calculate profile-job match |

### Module 6: Application Tracking
**Priority: P1 (High)**

#### 6.1 Applied Jobs Database
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| profile_id | UUID | Which profile was used |
| job_url | TEXT | Unique URL of job posting |
| job_title | TEXT | Position title |
| company | TEXT | Company name |
| applied_date | TIMESTAMP | When applied |
| status | ENUM | applied, interview, rejected, offer |
| notes | TEXT | User notes |

#### 6.2 Duplicate Detection
- URL normalization (remove tracking params)
- Warning notification when revisiting applied job
- Visual indicator on page (injected badge)

### Module 7: Settings & Configuration
**Priority: P1 (High)**

#### 7.1 General Settings
| Setting | Type | Default |
|---------|------|---------|
| Daily Goal | Number | 10 |
| Auto-Submit | Boolean | false |
| Auto-Next Page | Boolean | false |
| Notification Sound | Boolean | true |
| Dark Mode | Boolean | system |

#### 7.2 Scraping Settings
| Setting | Type | Default |
|---------|------|---------|
| Max Jobs Per Session | Number | 50 |
| Time Filter (hours) | Number | 24 |
| Request Delay (seconds) | Range | 3-7 |
| ATS Platforms | Multi-select | All enabled |

#### 7.3 Credentials Vault
- Encrypted storage for site credentials
- Per-site username/password
- Used for sites requiring account creation (Workday, etc.)

---

## 4. Technical Specifications

### 4.1 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Extension | React + TypeScript | Component reusability |
| Dashboard | Next.js 14 | SSR, API routes |
| Backend | Node.js + Express | JavaScript ecosystem |
| Database | PostgreSQL + pgvector | Relational + embeddings |
| Cache | Redis | Session, rate limiting |
| Scraping | Playwright | Better than Puppeteer for detection avoidance |
| Auth | Passport.js + Google OAuth | Industry standard |
| LLM Local | Ollama | Best local LLM runtime |

### 4.2 Database Schema (Core Tables)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  personal_info JSONB,
  education JSONB,
  work_history JSONB,
  skills JSONB,
  employment_info JSONB,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applied Jobs table
CREATE TABLE applied_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  profile_id UUID REFERENCES profiles(id),
  job_url TEXT NOT NULL,
  job_url_hash VARCHAR(64) NOT NULL,
  job_title VARCHAR(255),
  company VARCHAR(255),
  applied_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, job_url_hash)
);

-- Saved Responses table (for learning)
CREATE TABLE saved_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_text TEXT NOT NULL,
  question_embedding vector(384),
  response_text TEXT NOT NULL,
  keywords TEXT[],
  times_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scraped Jobs table
CREATE TABLE scraped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  job_url TEXT NOT NULL,
  job_url_hash VARCHAR(64) NOT NULL,
  job_title VARCHAR(255),
  company VARCHAR(255),
  description TEXT,
  summary TEXT,
  tech_stack TEXT[],
  posted_date TIMESTAMP,
  relevance_score INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  scraped_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 API Endpoints (Core)

```
Authentication:
POST   /api/auth/google          - Google OAuth callback
POST   /api/auth/refresh         - Refresh JWT token
DELETE /api/auth/logout          - Logout

Profiles:
GET    /api/profiles             - List user profiles
POST   /api/profiles             - Create profile
GET    /api/profiles/:id         - Get profile
PUT    /api/profiles/:id         - Update profile
DELETE /api/profiles/:id         - Delete profile
POST   /api/profiles/:id/export  - Export profile JSON
POST   /api/profiles/import      - Import profile JSON

Jobs:
GET    /api/jobs/scraped         - Get scraped job queue
GET    /api/jobs/applied         - Get applied jobs history
POST   /api/jobs/applied         - Mark job as applied
GET    /api/jobs/check-url       - Check if URL was applied

Scraping:
POST   /api/scraping/start       - Start scraping session
POST   /api/scraping/stop        - Stop scraping session
GET    /api/scraping/status      - Get scraping status

LLM:
POST   /api/llm/generate         - Generate response
POST   /api/llm/match-field      - Match field to profile
GET    /api/llm/status           - Check LLM connection

Settings:
GET    /api/settings             - Get user settings
PUT    /api/settings             - Update settings
```

---

## 5. Local LLM Recommendations

### 5.1 Recommended Models for M1 Pro (16GB RAM)

Apple Silicon provides excellent ML performance via Metal acceleration. With 16GB unified memory, you can run models up to 13B parameters efficiently.

| Model | Size | RAM Required | Speed on M1 Pro | Best For |
|-------|------|--------------|-----------------|----------|
| **Llama 3.2 3B Instruct** | 3B | ~4GB | ~80 tok/s | Quick responses |
| **Llama 3.2 8B Instruct** | 8B | ~6GB | ~40 tok/s | ⭐ Primary choice |
| **Qwen2.5 7B Instruct** | 7B | ~6GB | ~45 tok/s | Great instruction following |
| **Mistral 7B Instruct v0.3** | 7B | ~6GB | ~42 tok/s | Good reasoning |
| **Phi-3 Medium 14B** | 14B | ~10GB | ~25 tok/s | Complex responses |

### 5.2 Primary Recommendation for M1 Pro
**Llama 3.2 8B Instruct (Q4_K_M quantization)**

**Rationale:**
- Fits comfortably in 16GB with room for browser + app
- 40+ tokens/sec is fast enough for real-time form filling
- Excellent instruction following for structured tasks
- Native Metal acceleration via Ollama
- Good balance of speed vs quality

**Alternative for Speed**: Llama 3.2 3B when fast responses are critical
**Alternative for Quality**: Qwen2.5 7B for complex cover letter generation

### 5.3 Ollama Setup for macOS (M1 Pro)
```bash
# Install Ollama via Homebrew (recommended for Mac)
brew install ollama

# OR direct download
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended model (Q4_K_M = best quality/size ratio)
ollama pull llama3.2:8b-instruct-q4_K_M

# Pull backup smaller model for quick operations
ollama pull llama3.2:3b-instruct-q4_K_M

# Start Ollama server (runs on http://localhost:11434)
ollama serve

# Test the installation
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:8b-instruct-q4_K_M",
  "prompt": "Extract the job title from: Senior Full Stack Engineer at Google",
  "stream": false
}'

# Check running models
ollama list
```

### 5.4 Network LLM Configuration
For running Ollama on another machine in your network:
```bash
# On the host machine, set environment variable
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# From your Mac, configure the extension to use:
# http://192.168.x.x:11434 (replace with host IP)
```

---

## 6. Upskilling / Fine-Tuning Analysis

### 6.1 Review of HuggingFace Upskill Blog

Based on the [HuggingFace Upskill Blog](https://huggingface.co/blog/upskill):

**Key Findings:**
1. **Upskilling** refers to fine-tuning smaller models on domain-specific data to match larger model performance
2. **LoRA/QLoRA** makes fine-tuning feasible on consumer hardware
3. **Synthetic data generation** from larger models can create training data

### 6.2 Applicability to This Project

| Aspect | Feasibility | Notes |
|--------|-------------|-------|
| **Training Data** | ✅ High | User's saved responses become training data |
| **Hardware Requirements** | ✅ Feasible | QLoRA on 8GB+ VRAM GPU |
| **Domain Specificity** | ✅ Perfect fit | Job application forms are narrow domain |
| **Continuous Learning** | ⚠️ Moderate | Requires periodic retraining |

### 6.3 Recommended Upskilling Strategy

```
Phase 1: Collect Training Data
- Store all user corrections/edits to generated responses
- Format as instruction-response pairs
- Minimum 100-500 examples before fine-tuning

Phase 2: Fine-Tune with QLoRA
- Base model: Llama 3.2 3B or Phi-3 Mini
- Use unsloth or PEFT library
- Train on user's historical data
- 4-bit quantization for efficiency

Phase 3: Deploy Personal Model
- Export LoRA adapter
- Load in Ollama with base model
- User gets personalized model

Phase 4: Continuous Improvement
- Collect new corrections weekly
- Retrain adapter monthly
- A/B test against base model
```

### 6.4 Fine-Tuning Code Example
```python
from unsloth import FastLanguageModel
from trl import SFTTrainer

# Load base model with 4-bit quantization
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Phi-3-mini-4k-instruct",
    max_seq_length=2048,
    load_in_4bit=True,
)

# Add LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_alpha=16,
    lora_dropout=0,
)

# Train on user's saved responses
trainer = SFTTrainer(
    model=model,
    train_dataset=user_responses_dataset,
    max_seq_length=2048,
    dataset_text_field="text",
)
trainer.train()

# Export for Ollama
model.save_pretrained_merged("job-agent-finetuned", tokenizer)
```

---

## 7. Development Phases

### Phase 1: Foundation (Weeks 1-3)
- [ ] Project scaffolding (monorepo with Turborepo)
- [ ] Database setup (PostgreSQL + migrations)
- [ ] Basic authentication (Google OAuth)
- [ ] Chrome extension boilerplate
- [ ] Basic dashboard UI

**Verification:** User can log in, extension loads, dashboard displays

### Phase 2: Profile System (Weeks 4-5)
- [ ] Profile CRUD operations
- [ ] Multi-profile support
- [ ] Import/Export functionality
- [ ] Resume upload/storage

**Verification:** User can create, edit, switch, export/import profiles

### Phase 3: LLM Integration (Weeks 6-7)
- [ ] Ollama connector
- [ ] Cloud API connectors (OpenAI, Anthropic)
- [ ] Prompt templates
- [ ] Health monitoring

**Verification:** LLM generates responses via dashboard test interface

### Phase 4: Auto-Fill System (Weeks 8-10)
- [ ] Form field detection
- [ ] Field-to-profile matching
- [ ] Auto-fill injection
- [ ] Generate button for long fields
- [ ] File upload handling

**Verification:** Extension auto-fills test forms on Greenhouse, Lever

### Phase 5: Job Scraping (Weeks 11-13)
- [ ] Boolean search implementation
- [ ] ATS site scrapers
- [ ] Job queue management
- [ ] Human mimicking system
- [ ] Job summary generation

**Verification:** Scraping returns 50+ jobs from configured ATS sites

### Phase 6: Application Tracking (Weeks 14-15)
- [ ] Applied jobs database
- [ ] Duplicate detection
- [ ] URL monitoring
- [ ] Statistics dashboard

**Verification:** Applied jobs tracked, duplicates warned

### Phase 7: Learning System (Weeks 16-17)
- [ ] Response storage
- [ ] Embedding generation
- [ ] Similar response retrieval
- [ ] Feedback loop UI

**Verification:** System suggests previous responses for similar questions

### Phase 8: Polish & Testing (Weeks 18-20)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Beta testing

**Verification:** Full workflow tested on 5+ ATS platforms

---

## 8. Testing Strategy

### 8.1 Unit Testing
- Jest for backend services
- React Testing Library for UI components
- Minimum 80% coverage for core modules

### 8.2 Integration Testing
- API endpoint testing with Supertest
- Database operations testing
- LLM response mocking

### 8.3 E2E Testing
- Playwright for extension testing
- Test against sandbox job applications
- Cross-browser compatibility

### 8.4 Manual Testing Checklist
- [ ] Form filling on Greenhouse
- [ ] Form filling on Lever
- [ ] Form filling on Workday
- [ ] Duplicate URL detection
- [ ] Profile switching
- [ ] Scraping rate limiting
- [ ] LLM failover

---

## 9. Security Considerations

| Concern | Mitigation |
|---------|------------|
| Credential Storage | AES-256 encryption at rest |
| API Keys | Environment variables, never in code |
| Personal Data | Local-first, encrypted sync |
| Session Hijacking | HTTP-only cookies, CSRF tokens |
| Injection Attacks | Parameterized queries, input sanitization |

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Time to fill application | < 2 minutes (vs 15+ manual) |
| Auto-fill accuracy | > 90% correct fields |
| Daily applications | 20+ with automation |
| User retention | 70% weekly active |
| LLM response quality | > 4/5 user rating |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ATS site changes | High | Medium | Modular scrapers, quick updates |
| Rate limiting/blocking | High | High | Human mimicking, IP rotation |
| LLM response quality | Medium | Medium | Fallback to templates |
| Chrome policy changes | Low | High | Firefox backup plan |
| Data loss | Low | Critical | Regular backups, export feature |

---

## 12. Future Enhancements (Post-MVP)

1. **Firefox Extension** - Cross-browser support
2. **Mobile App** - React Native companion
3. **Interview Prep** - AI-generated prep based on JD
4. **Salary Insights** - Integrate compensation data
5. **Network Feature** - Connect users for referrals
6. **Analytics Dashboard** - Application funnel metrics
7. **Email Integration** - Track responses from companies
8. **Calendar Sync** - Auto-add interview schedules

---

## 13. Appendix

### A. Glossary
- **ATS**: Applicant Tracking System
- **Boolean Search**: Search using AND, OR, site: operators
- **LoRA**: Low-Rank Adaptation (efficient fine-tuning)
- **Ollama**: Local LLM runtime
- **pgvector**: PostgreSQL extension for vector embeddings

### B. References
- [Ollama Documentation](https://ollama.ai/docs)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [HuggingFace Upskill Blog](https://huggingface.co/blog/upskill)
- [Unsloth Fine-Tuning](https://github.com/unslothai/unsloth)

---

**Document Status:** Draft v1.0  
**Last Updated:** January 2025  
**Author:** AI Engineering Team  
**Review Required:** Product Owner, Security, Legal
