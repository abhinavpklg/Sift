# Module 1: Chrome Extension Core
## Technical Specification & Implementation Guide

---

## 1. Module Overview

**Objective**: Build the foundational Chrome extension with basic UI, profile management, and auto-fill capabilities for Greenhouse and Lever (MVP ATS platforms).

**Duration**: Weeks 1-4  
**Dependencies**: None (foundation module)

---

## 2. Project Structure

```
job-agent/
├── apps/
│   ├── extension/                 # Chrome Extension (Manifest V3)
│   │   ├── public/
│   │   │   ├── manifest.json
│   │   │   ├── icons/
│   │   │   │   ├── icon16.png
│   │   │   │   ├── icon48.png
│   │   │   │   └── icon128.png
│   │   │   └── _locales/
│   │   ├── src/
│   │   │   ├── popup/            # Extension popup UI
│   │   │   │   ├── App.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Stats.tsx
│   │   │   │   │   ├── ProfileSwitcher.tsx
│   │   │   │   │   ├── QuickActions.tsx
│   │   │   │   │   └── Settings.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── index.tsx
│   │   │   ├── content/          # Content scripts (injected)
│   │   │   │   ├── index.ts
│   │   │   │   ├── detector/
│   │   │   │   │   ├── FormDetector.ts
│   │   │   │   │   ├── FieldClassifier.ts
│   │   │   │   │   └── ats/
│   │   │   │   │       ├── greenhouse.ts
│   │   │   │   │       ├── lever.ts
│   │   │   │   │       └── index.ts
│   │   │   │   ├── filler/
│   │   │   │   │   ├── AutoFiller.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   ├── TextStrategy.ts
│   │   │   │   │   │   ├── SelectStrategy.ts
│   │   │   │   │   │   ├── RadioStrategy.ts
│   │   │   │   │   │   ├── CheckboxStrategy.ts
│   │   │   │   │   │   ├── DateStrategy.ts
│   │   │   │   │   │   └── FileStrategy.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ui/
│   │   │   │   │   ├── GenerateButton.ts
│   │   │   │   │   ├── AppliedBadge.ts
│   │   │   │   │   └── FloatingPanel.ts
│   │   │   │   └── utils/
│   │   │   ├── background/       # Service worker
│   │   │   │   ├── index.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── storage.ts
│   │   │   │   └── badge.ts
│   │   │   ├── options/          # Full-page options/dashboard
│   │   │   │   ├── App.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── Profile.tsx
│   │   │   │   │   ├── Settings.tsx
│   │   │   │   │   ├── Jobs.tsx
│   │   │   │   │   ├── History.tsx
│   │   │   │   │   └── LLMConfig.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── shared/
│   │   │   │   ├── types/
│   │   │   │   │   ├── profile.ts
│   │   │   │   │   ├── job.ts
│   │   │   │   │   ├── settings.ts
│   │   │   │   │   └── messages.ts
│   │   │   │   ├── constants/
│   │   │   │   ├── storage/
│   │   │   │   │   ├── ProfileStorage.ts
│   │   │   │   │   ├── JobStorage.ts
│   │   │   │   │   └── SettingsStorage.ts
│   │   │   │   └── llm/
│   │   │   │       ├── OllamaClient.ts
│   │   │   │       ├── OpenAIClient.ts
│   │   │   │       └── LLMRouter.ts
│   │   │   └── styles/
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── dashboard/                # Next.js Web Dashboard (Phase 2)
│       └── ...
│
├── packages/
│   ├── shared-types/             # Shared TypeScript types
│   ├── llm-client/               # LLM abstraction layer
│   └── ats-scrapers/             # ATS-specific scrapers (Phase 3)
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 3. Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "AI Job Agent",
  "version": "0.1.0",
  "description": "AI-powered job application assistant",
  
  "permissions": [
    "storage",
    "activeTab",
    "tabs",
    "notifications",
    "alarms"
  ],
  
  "host_permissions": [
    "https://boards.greenhouse.io/*",
    "https://jobs.greenhouse.io/*",
    "https://jobs.lever.co/*",
    "https://www.myworkdayjobs.com/*",
    "https://*.icims.com/*",
    "https://*.ashbyhq.com/*",
    "https://*.smartrecruiters.com/*",
    "http://localhost:11434/*"
  ],
  
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "options_page": "src/options/index.html",
  
  "content_scripts": [
    {
      "matches": [
        "https://boards.greenhouse.io/*",
        "https://jobs.greenhouse.io/*",
        "https://jobs.lever.co/*"
      ],
      "js": ["src/content/index.ts"],
      "css": ["src/styles/content.css"],
      "run_at": "document_idle"
    }
  ],
  
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  
  "web_accessible_resources": [
    {
      "resources": ["icons/*", "src/styles/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 4. Core Type Definitions

```typescript
// src/shared/types/profile.ts

export interface UserProfile {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  personalInfo: PersonalInfo;
  education: Education[];
  workHistory: WorkExperience[];
  skills: Skills;
  documents: Documents;
  employmentInfo: EmploymentInfo;
  savedResponses: SavedResponse[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  linkedIn: string;
  portfolio: string;
  github?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  gpa?: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

export interface Skills {
  technical: string[];
  soft: string[];
  languages: { language: string; proficiency: string }[];
  certifications: string[];
}

export interface Documents {
  resumeDataUrl?: string;  // Base64 encoded
  resumeFileName?: string;
  coverLetterTemplate?: string;
}

export interface EmploymentInfo {
  workAuthorization: 'citizen' | 'permanent_resident' | 'visa' | 'other';
  requiresSponsorship: boolean;
  disability: 'yes' | 'no' | 'prefer_not_to_say';
  veteranStatus: 'yes' | 'no' | 'prefer_not_to_say';
  gender?: string;
  ethnicity?: string;
  ageRange?: string;
}

export interface SavedResponse {
  id: string;
  keywords: string[];
  question: string;
  response: string;
  timesUsed: number;
  lastUsed: string;
}

// src/shared/types/settings.ts

export interface UserSettings {
  general: {
    dailyGoal: number;
    autoSubmit: boolean;
    autoNextPage: boolean;
    notificationSound: boolean;
    darkMode: 'light' | 'dark' | 'system';
  };
  scraping: {
    maxJobsPerSession: number;
    timeFilterHours: number;
    requestDelayMin: number;
    requestDelayMax: number;
    enabledPlatforms: string[];
  };
  llm: {
    provider: 'ollama' | 'openai' | 'anthropic' | 'custom';
    endpoint: string;
    model: string;
    apiKey?: string;
    maxTokens: number;
    temperature: number;
  };
  credentials: EncryptedCredential[];
}

export interface EncryptedCredential {
  id: string;
  domain: string;
  username: string;
  encryptedPassword: string;
}

// src/shared/types/job.ts

export interface ScrapedJob {
  id: string;
  url: string;
  urlHash: string;
  title: string;
  company: string;
  location: string;
  description: string;
  summary: string;
  techStack: string[];
  postedDate: string;
  postedAgo: string;
  relevanceScore: number;
  status: 'pending' | 'applied' | 'skipped' | 'saved';
  scrapedAt: string;
  atsSource: string;
}

export interface AppliedJob {
  id: string;
  profileId: string;
  url: string;
  urlHash: string;
  title: string;
  company: string;
  appliedAt: string;
  status: 'applied' | 'interview' | 'rejected' | 'offer';
  notes: string;
}

// src/shared/types/messages.ts

export type MessageType =
  | { type: 'GET_ACTIVE_PROFILE'; }
  | { type: 'SET_ACTIVE_PROFILE'; profileId: string }
  | { type: 'FILL_FORM'; }
  | { type: 'CHECK_URL'; url: string }
  | { type: 'MARK_APPLIED'; job: AppliedJob }
  | { type: 'GET_STATS'; }
  | { type: 'LLM_GENERATE'; prompt: string; context?: string }
  | { type: 'INCREMENT_COUNTER'; };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 5. Storage Layer Implementation

```typescript
// src/shared/storage/ProfileStorage.ts

import { UserProfile } from '../types/profile';

const PROFILES_KEY = 'job_agent_profiles';
const ACTIVE_PROFILE_KEY = 'job_agent_active_profile';

export class ProfileStorage {
  static async getAll(): Promise<UserProfile[]> {
    const result = await chrome.storage.local.get(PROFILES_KEY);
    return result[PROFILES_KEY] || [];
  }

  static async getActive(): Promise<UserProfile | null> {
    const result = await chrome.storage.local.get(ACTIVE_PROFILE_KEY);
    const activeId = result[ACTIVE_PROFILE_KEY];
    if (!activeId) return null;
    
    const profiles = await this.getAll();
    return profiles.find(p => p.id === activeId) || null;
  }

  static async setActive(profileId: string): Promise<void> {
    await chrome.storage.local.set({ [ACTIVE_PROFILE_KEY]: profileId });
    
    // Update isActive flag on all profiles
    const profiles = await this.getAll();
    const updated = profiles.map(p => ({
      ...p,
      isActive: p.id === profileId
    }));
    await chrome.storage.local.set({ [PROFILES_KEY]: updated });
  }

  static async create(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const profiles = await this.getAll();
    profiles.push(newProfile);
    await chrome.storage.local.set({ [PROFILES_KEY]: profiles });
    
    return newProfile;
  }

  static async update(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profiles = await this.getAll();
    const index = profiles.findIndex(p => p.id === profileId);
    if (index === -1) return null;
    
    profiles[index] = {
      ...profiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await chrome.storage.local.set({ [PROFILES_KEY]: profiles });
    return profiles[index];
  }

  static async delete(profileId: string): Promise<boolean> {
    const profiles = await this.getAll();
    const filtered = profiles.filter(p => p.id !== profileId);
    if (filtered.length === profiles.length) return false;
    
    await chrome.storage.local.set({ [PROFILES_KEY]: filtered });
    return true;
  }

  static async export(profileId: string): Promise<string | null> {
    const profiles = await this.getAll();
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return null;
    
    return JSON.stringify(profile, null, 2);
  }

  static async import(jsonString: string): Promise<UserProfile> {
    const imported = JSON.parse(jsonString) as UserProfile;
    
    // Generate new ID to avoid conflicts
    const newProfile: UserProfile = {
      ...imported,
      id: crypto.randomUUID(),
      name: `${imported.name} (Imported)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
    };
    
    const profiles = await this.getAll();
    profiles.push(newProfile);
    await chrome.storage.local.set({ [PROFILES_KEY]: profiles });
    
    return newProfile;
  }
}
```

---

## 6. LLM Client Implementation

```typescript
// src/shared/llm/OllamaClient.ts

export interface OllamaConfig {
  endpoint: string;  // default: http://localhost:11434
  model: string;     // default: llama3.2:8b-instruct-q4_K_M
  maxTokens: number;
  temperature: number;
}

export interface GenerateResponse {
  response: string;
  totalDuration: number;
  evalCount: number;
}

export class OllamaClient {
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      endpoint: config.endpoint || 'http://localhost:11434',
      model: config.model || 'llama3.2:8b-instruct-q4_K_M',
      maxTokens: config.maxTokens || 1024,
      temperature: config.temperature || 0.7,
    };
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.config.endpoint}/api/tags`);
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  }

  async generate(prompt: string, systemPrompt?: string): Promise<GenerateResponse> {
    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
        options: {
          num_predict: this.config.maxTokens,
          temperature: this.config.temperature,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      response: data.response,
      totalDuration: data.total_duration,
      evalCount: data.eval_count,
    };
  }

  // Specialized method for form field matching
  async matchFieldToProfile(
    fieldLabel: string,
    fieldType: string,
    profileKeys: string[]
  ): Promise<string | null> {
    const prompt = `Given this form field:
Label: "${fieldLabel}"
Type: ${fieldType}

Match it to ONE of these profile fields (respond with just the field name, or "null" if no match):
${profileKeys.join(', ')}

Response:`;

    const result = await this.generate(prompt);
    const match = result.response.trim().toLowerCase();
    
    return match === 'null' ? null : match;
  }

  // Specialized method for generating long-form responses
  async generateResponse(
    question: string,
    profileContext: string,
    previousResponses?: string[]
  ): Promise<string> {
    const systemPrompt = `You are helping fill out a job application. 
Generate a professional, concise response based on the candidate's profile.
Keep responses focused and relevant. Do not make up information not in the profile.`;

    const prompt = `Profile Information:
${profileContext}

${previousResponses?.length ? `Similar past responses for reference:
${previousResponses.join('\n---\n')}` : ''}

Question: ${question}

Generate an appropriate response (2-4 sentences unless the question requires more):`;

    const result = await this.generate(prompt, systemPrompt);
    return result.response.trim();
  }
}

// src/shared/llm/LLMRouter.ts

import { OllamaClient } from './OllamaClient';

export type LLMProvider = 'ollama' | 'openai' | 'anthropic';

export class LLMRouter {
  private provider: LLMProvider;
  private client: OllamaClient; // Will add OpenAI/Anthropic later

  constructor(settings: { provider: LLMProvider; endpoint: string; model: string; apiKey?: string }) {
    this.provider = settings.provider;
    
    // For now, only Ollama is implemented
    this.client = new OllamaClient({
      endpoint: settings.endpoint,
      model: settings.model,
    });
  }

  async checkConnection(): Promise<boolean> {
    return this.client.checkHealth();
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const result = await this.client.generate(prompt, systemPrompt);
    return result.response;
  }

  async matchField(label: string, type: string, profileKeys: string[]): Promise<string | null> {
    return this.client.matchFieldToProfile(label, type, profileKeys);
  }

  async generateFormResponse(question: string, context: string, history?: string[]): Promise<string> {
    return this.client.generateResponse(question, context, history);
  }
}
```

---

## 7. Content Script - Form Detection

```typescript
// src/content/detector/FormDetector.ts

export interface DetectedField {
  element: HTMLElement;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file';
  label: string;
  name: string;
  id: string;
  required: boolean;
  placeholder?: string;
  options?: string[];  // For select/radio
  maxLength?: number;
}

export class FormDetector {
  detectForms(): HTMLFormElement[] {
    return Array.from(document.querySelectorAll('form'));
  }

  detectFields(form?: HTMLFormElement): DetectedField[] {
    const container = form || document;
    const fields: DetectedField[] = [];

    // Input fields
    const inputs = container.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    inputs.forEach(input => {
      const field = this.analyzeInputField(input as HTMLInputElement);
      if (field) fields.push(field);
    });

    // Textareas
    const textareas = container.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      fields.push(this.analyzeTextarea(textarea as HTMLTextAreaElement));
    });

    // Selects
    const selects = container.querySelectorAll('select');
    selects.forEach(select => {
      fields.push(this.analyzeSelect(select as HTMLSelectElement));
    });

    return fields;
  }

  private analyzeInputField(input: HTMLInputElement): DetectedField | null {
    const type = input.type.toLowerCase();
    
    // Skip hidden, submit, button types
    if (['hidden', 'submit', 'button', 'reset'].includes(type)) {
      return null;
    }

    return {
      element: input,
      type: this.normalizeInputType(type),
      label: this.findLabel(input),
      name: input.name,
      id: input.id,
      required: input.required || input.getAttribute('aria-required') === 'true',
      placeholder: input.placeholder,
      maxLength: input.maxLength > 0 ? input.maxLength : undefined,
    };
  }

  private analyzeTextarea(textarea: HTMLTextAreaElement): DetectedField {
    return {
      element: textarea,
      type: 'textarea',
      label: this.findLabel(textarea),
      name: textarea.name,
      id: textarea.id,
      required: textarea.required,
      placeholder: textarea.placeholder,
      maxLength: textarea.maxLength > 0 ? textarea.maxLength : undefined,
    };
  }

  private analyzeSelect(select: HTMLSelectElement): DetectedField {
    const options = Array.from(select.options)
      .map(opt => opt.text)
      .filter(text => text.trim() !== '');

    return {
      element: select,
      type: 'select',
      label: this.findLabel(select),
      name: select.name,
      id: select.id,
      required: select.required,
      options,
    };
  }

  private findLabel(element: HTMLElement): string {
    // 1. Check for associated label via 'for' attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent?.trim() || '';
    }

    // 2. Check for wrapping label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      const text = parentLabel.textContent?.replace(element.textContent || '', '').trim();
      if (text) return text;
    }

    // 3. Check aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // 4. Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent?.trim() || '';
    }

    // 5. Check placeholder as fallback
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (element.placeholder) return element.placeholder;
    }

    // 6. Check preceding sibling or parent for text
    const prev = element.previousElementSibling;
    if (prev && prev.textContent) {
      return prev.textContent.trim();
    }

    // 7. Use name attribute as last resort
    return element.getAttribute('name') || '';
  }

  private normalizeInputType(type: string): DetectedField['type'] {
    switch (type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'date': return 'date';
      case 'file': return 'file';
      case 'radio': return 'radio';
      case 'checkbox': return 'checkbox';
      default: return 'text';
    }
  }
}
```

---

## 8. Content Script - Auto Filler

```typescript
// src/content/filler/AutoFiller.ts

import { DetectedField } from '../detector/FormDetector';
import { UserProfile } from '../../shared/types/profile';
import { LLMRouter } from '../../shared/llm/LLMRouter';

export class AutoFiller {
  private profile: UserProfile;
  private llm: LLMRouter;
  private fieldMappings: Map<string, string>;

  constructor(profile: UserProfile, llm: LLMRouter) {
    this.profile = profile;
    this.llm = llm;
    this.fieldMappings = this.buildFieldMappings();
  }

  private buildFieldMappings(): Map<string, string> {
    // Common field label patterns → profile paths
    return new Map([
      // Personal Info
      ['first name', 'personalInfo.firstName'],
      ['first_name', 'personalInfo.firstName'],
      ['firstname', 'personalInfo.firstName'],
      ['last name', 'personalInfo.lastName'],
      ['last_name', 'personalInfo.lastName'],
      ['lastname', 'personalInfo.lastName'],
      ['full name', 'personalInfo.fullName'],
      ['name', 'personalInfo.fullName'],
      ['email', 'personalInfo.email'],
      ['e-mail', 'personalInfo.email'],
      ['phone', 'personalInfo.phone'],
      ['phone number', 'personalInfo.phone'],
      ['mobile', 'personalInfo.phone'],
      ['linkedin', 'personalInfo.linkedIn'],
      ['linkedin url', 'personalInfo.linkedIn'],
      ['portfolio', 'personalInfo.portfolio'],
      ['website', 'personalInfo.portfolio'],
      ['github', 'personalInfo.github'],
      
      // Address
      ['city', 'personalInfo.address.city'],
      ['state', 'personalInfo.address.state'],
      ['zip', 'personalInfo.address.zipCode'],
      ['zip code', 'personalInfo.address.zipCode'],
      ['postal code', 'personalInfo.address.zipCode'],
      ['country', 'personalInfo.address.country'],
      ['street', 'personalInfo.address.street'],
      ['address', 'personalInfo.address.street'],
      
      // Employment
      ['work authorization', 'employmentInfo.workAuthorization'],
      ['authorized to work', 'employmentInfo.workAuthorization'],
      ['sponsorship', 'employmentInfo.requiresSponsorship'],
      ['require sponsorship', 'employmentInfo.requiresSponsorship'],
      ['visa sponsorship', 'employmentInfo.requiresSponsorship'],
      ['disability', 'employmentInfo.disability'],
      ['veteran', 'employmentInfo.veteranStatus'],
      ['gender', 'employmentInfo.gender'],
      ['ethnicity', 'employmentInfo.ethnicity'],
      ['race', 'employmentInfo.ethnicity'],
    ]);
  }

  async fillField(field: DetectedField): Promise<boolean> {
    const labelLower = field.label.toLowerCase();
    
    // Try direct mapping first
    for (const [pattern, profilePath] of this.fieldMappings) {
      if (labelLower.includes(pattern)) {
        const value = this.getValueFromPath(profilePath);
        if (value !== undefined) {
          return this.setValue(field, value);
        }
      }
    }

    // Fall back to LLM matching for complex fields
    if (field.type === 'textarea' && (field.maxLength || 0) > 200) {
      // Long text field - will be handled by Generate button
      return false;
    }

    // Try LLM field matching for unmatched fields
    const profileKeys = this.getFlatProfileKeys();
    const match = await this.llm.matchField(field.label, field.type, profileKeys);
    
    if (match) {
      const value = this.getValueFromPath(match);
      if (value !== undefined) {
        return this.setValue(field, value);
      }
    }

    return false;
  }

  private setValue(field: DetectedField, value: any): boolean {
    const element = field.element;

    try {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
          (element as HTMLInputElement).value = String(value);
          this.triggerInputEvents(element);
          return true;

        case 'textarea':
          (element as HTMLTextAreaElement).value = String(value);
          this.triggerInputEvents(element);
          return true;

        case 'select':
          return this.setSelectValue(element as HTMLSelectElement, value);

        case 'radio':
          return this.setRadioValue(element as HTMLInputElement, value);

        case 'checkbox':
          (element as HTMLInputElement).checked = Boolean(value);
          this.triggerInputEvents(element);
          return true;

        case 'date':
          (element as HTMLInputElement).value = this.formatDate(value);
          this.triggerInputEvents(element);
          return true;

        case 'file':
          // File uploads are handled separately
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error('AutoFiller: Error setting value', error);
      return false;
    }
  }

  private setSelectValue(select: HTMLSelectElement, value: any): boolean {
    const valueStr = String(value).toLowerCase();
    
    // Try exact match first
    for (const option of select.options) {
      if (option.value.toLowerCase() === valueStr || 
          option.text.toLowerCase() === valueStr) {
        select.value = option.value;
        this.triggerInputEvents(select);
        return true;
      }
    }

    // Try fuzzy match
    for (const option of select.options) {
      if (option.text.toLowerCase().includes(valueStr) ||
          valueStr.includes(option.text.toLowerCase())) {
        select.value = option.value;
        this.triggerInputEvents(select);
        return true;
      }
    }

    return false;
  }

  private setRadioValue(radio: HTMLInputElement, value: any): boolean {
    const name = radio.name;
    const radios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    const valueStr = String(value).toLowerCase();

    for (const r of radios) {
      const radioEl = r as HTMLInputElement;
      const label = this.findRadioLabel(radioEl).toLowerCase();
      
      if (radioEl.value.toLowerCase() === valueStr || label.includes(valueStr)) {
        radioEl.checked = true;
        this.triggerInputEvents(radioEl);
        return true;
      }
    }

    return false;
  }

  private findRadioLabel(radio: HTMLInputElement): string {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    return label?.textContent?.trim() || radio.value;
  }

  private triggerInputEvents(element: HTMLElement): void {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  private formatDate(value: string): string {
    try {
      const date = new Date(value);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch {
      return value;
    }
  }

  private getValueFromPath(path: string): any {
    const parts = path.split('.');
    let current: any = this.profile;
    
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    
    // Special case: fullName
    if (path === 'personalInfo.fullName') {
      const p = this.profile.personalInfo;
      return `${p.firstName} ${p.lastName}`;
    }
    
    return current;
  }

  private getFlatProfileKeys(): string[] {
    return [
      'personalInfo.firstName',
      'personalInfo.lastName', 
      'personalInfo.email',
      'personalInfo.phone',
      'personalInfo.linkedIn',
      'personalInfo.portfolio',
      'personalInfo.github',
      'personalInfo.address.city',
      'personalInfo.address.state',
      'personalInfo.address.zipCode',
      'personalInfo.address.country',
      'employmentInfo.workAuthorization',
      'employmentInfo.requiresSponsorship',
      'employmentInfo.disability',
      'employmentInfo.veteranStatus',
      'employmentInfo.gender',
      'employmentInfo.ethnicity',
    ];
  }
}
```

---

## 9. Testing Checkpoints

### Checkpoint 1: Extension Loads (Week 1)
```bash
# Load unpacked extension in Chrome
1. Navigate to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `apps/extension/dist` folder
5. Verify extension icon appears in toolbar

# Test: Popup opens
- Click extension icon
- Popup should display with default UI
```

### Checkpoint 2: Storage Works (Week 2)
```javascript
// Run in extension's background console
const testProfile = {
  name: 'Test Profile',
  personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' }
};

// Test create
await ProfileStorage.create(testProfile);
const profiles = await ProfileStorage.getAll();
console.assert(profiles.length === 1, 'Profile created');

// Test set active
await ProfileStorage.setActive(profiles[0].id);
const active = await ProfileStorage.getActive();
console.assert(active.name === 'Test Profile', 'Active profile set');
```

### Checkpoint 3: LLM Connection (Week 3)
```javascript
// Test Ollama connection
const client = new OllamaClient();
const healthy = await client.checkHealth();
console.log('Ollama healthy:', healthy);

const models = await client.listModels();
console.log('Available models:', models);

const response = await client.generate('Hello, respond with "OK"');
console.log('LLM Response:', response);
```

### Checkpoint 4: Form Detection (Week 3)
```javascript
// Run on a Greenhouse job application page
const detector = new FormDetector();
const fields = detector.detectFields();
console.log('Detected fields:', fields.map(f => ({
  label: f.label,
  type: f.type,
  name: f.name
})));
```

### Checkpoint 5: Auto-Fill Works (Week 4)
```javascript
// Full integration test
1. Create a test profile with all fields populated
2. Navigate to https://boards.greenhouse.io/example/jobs/123
3. Click extension icon → "Fill Form"
4. Verify fields are populated correctly
5. Check console for any errors
```

---

## 10. Development Commands

```bash
# Initial setup
pnpm install

# Development (with hot reload)
pnpm --filter extension dev

# Build for production
pnpm --filter extension build

# Type checking
pnpm --filter extension typecheck

# Lint
pnpm --filter extension lint

# Test
pnpm --filter extension test
```

---

## 11. Next Steps After Module 1

Once Module 1 is complete and verified:

1. **Module 2**: Add full Options page with profile editing UI
2. **Module 3**: Integrate LLM for complex field generation
3. **Module 4**: Add Workday and iCIMS scrapers
4. **Module 5**: Implement job scraping engine
5. **Module 6**: Build full dashboard with Next.js

---

**Module Status**: Ready for Implementation  
**Estimated Effort**: 4 weeks  
**Team Size**: 1 developer
