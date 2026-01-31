/**
 * Settings Types for Sift Chrome Extension
 * STORAGE-002: Type definitions for user settings
 */

export interface UserSettings {
  general: GeneralSettings;
  scraping: ScrapingSettings;
  llm: LLMSettings;
  credentials: EncryptedCredential[];
}

export interface GeneralSettings {
  dailyGoal: number;
  autoSubmit: boolean;
  autoNextPage: boolean;
  notificationSound: boolean;
  darkMode: 'light' | 'dark' | 'system';
  showAppliedBadge: boolean;
  confirmBeforeSubmit: boolean;
}

export interface ScrapingSettings {
  maxJobsPerSession: number;
  timeFilterHours: number;
  requestDelayMin: number;
  requestDelayMax: number;
  enabledPlatforms: string[];
  autoStartScraping: boolean;
  pauseOnRateLimit: boolean;
}

export interface LLMSettings {
  provider: 'ollama' | 'openai' | 'anthropic' | 'custom';
  endpoint: string;
  model: string;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface EncryptedCredential {
  id: string;
  domain: string;
  username: string;
  encryptedPassword: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    dailyGoal: 10,
    autoSubmit: false,
    autoNextPage: false,
    notificationSound: true,
    darkMode: 'system',
    showAppliedBadge: true,
    confirmBeforeSubmit: true,
  },
  scraping: {
    maxJobsPerSession: 50,
    timeFilterHours: 24,
    requestDelayMin: 3,
    requestDelayMax: 7,
    enabledPlatforms: [
      'greenhouse.io',
      'lever.co',
      'ashbyhq.com',
      'smartrecruiters.com',
      'myworkdayjobs.com',
      'icims.com',
    ],
    autoStartScraping: false,
    pauseOnRateLimit: true,
  },
  llm: {
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    model: 'llama3.2:8b-instruct-q4_K_M',
    maxTokens: 1024,
    temperature: 0.7,
    timeout: 30000,
  },
  credentials: [],
};

/**
 * Settings version for migrations
 */
export const SETTINGS_VERSION = 1;

/**
 * Partial settings update type
 */
export type SettingsUpdate = {
  general?: Partial<GeneralSettings>;
  scraping?: Partial<ScrapingSettings>;
  llm?: Partial<LLMSettings>;
  credentials?: EncryptedCredential[];
};

/**
 * Available ATS platforms
 */
export const ATS_PLATFORMS = [
  { id: 'greenhouse.io', name: 'Greenhouse', category: 'mid-market' },
  { id: 'lever.co', name: 'Lever', category: 'mid-market' },
  { id: 'ashbyhq.com', name: 'Ashby', category: 'mid-market' },
  { id: 'smartrecruiters.com', name: 'SmartRecruiters', category: 'mid-market' },
  { id: 'myworkdayjobs.com', name: 'Workday', category: 'enterprise' },
  { id: 'icims.com', name: 'iCIMS', category: 'enterprise' },
  { id: 'jobvite.com', name: 'Jobvite', category: 'mid-market' },
  { id: 'bamboohr.com', name: 'BambooHR', category: 'mid-market' },
  { id: 'workable.com', name: 'Workable', category: 'mid-market' },
  { id: 'taleo.net', name: 'Oracle Taleo', category: 'enterprise' },
  { id: 'successfactors.com', name: 'SAP SuccessFactors', category: 'enterprise' },
  { id: 'brassring.com', name: 'BrassRing', category: 'enterprise' },
] as const;

export type ATSPlatformId = typeof ATS_PLATFORMS[number]['id'];
