/**
 * Settings Types for Sift
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
  darkMode: ThemeMode;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ScrapingSettings {
  maxJobsPerSession: number;
  timeFilterHours: number;
  requestDelayMin: number;
  requestDelayMax: number;
  enabledPlatforms: string[];
}

export interface LLMSettings {
  provider: LLMProvider;
  endpoint: string;
  model: string;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
}

export type LLMProvider = 'ollama' | 'openai' | 'anthropic' | 'custom';

export interface EncryptedCredential {
  id: string;
  domain: string;
  username: string;
  encryptedPassword: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    dailyGoal: 10,
    autoSubmit: false,
    autoNextPage: false,
    notificationSound: true,
    darkMode: 'system',
  },
  scraping: {
    maxJobsPerSession: 50,
    timeFilterHours: 24,
    requestDelayMin: 3,
    requestDelayMax: 7,
    enabledPlatforms: [
      'greenhouse',
      'lever',
      'ashby',
      'smartrecruiters',
      'workday',
      'icims',
    ],
  },
  llm: {
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    model: 'llama3.2:8b-instruct-q4_K_M',
    maxTokens: 1024,
    temperature: 0.7,
  },
  credentials: [],
};

/**
 * ATS Platform definitions
 */
export interface ATSPlatform {
  id: string;
  name: string;
  domain: string;
  category: ATSCategory;
  enabled: boolean;
}

export type ATSCategory = 
  | 'enterprise' 
  | 'mid_market' 
  | 'smb' 
  | 'technical' 
  | 'staffing' 
  | 'ai_powered';

export const ATS_PLATFORMS: ATSPlatform[] = [
  // Enterprise
  { id: 'workday', name: 'Workday', domain: 'myworkdayjobs.com', category: 'enterprise', enabled: true },
  { id: 'icims', name: 'iCIMS', domain: 'icims.com', category: 'enterprise', enabled: true },
  { id: 'taleo', name: 'Oracle Taleo', domain: 'taleo.net', category: 'enterprise', enabled: false },
  { id: 'successfactors', name: 'SAP SuccessFactors', domain: 'successfactors.com', category: 'enterprise', enabled: false },
  
  // Mid-Market
  { id: 'greenhouse', name: 'Greenhouse', domain: 'greenhouse.io', category: 'mid_market', enabled: true },
  { id: 'lever', name: 'Lever', domain: 'lever.co', category: 'mid_market', enabled: true },
  { id: 'ashby', name: 'Ashby', domain: 'ashbyhq.com', category: 'mid_market', enabled: true },
  { id: 'smartrecruiters', name: 'SmartRecruiters', domain: 'smartrecruiters.com', category: 'mid_market', enabled: true },
  { id: 'jobvite', name: 'Jobvite', domain: 'jobvite.com', category: 'mid_market', enabled: false },
  { id: 'bamboohr', name: 'BambooHR', domain: 'bamboohr.com', category: 'mid_market', enabled: false },
  { id: 'workable', name: 'Workable', domain: 'workable.com', category: 'mid_market', enabled: false },
  { id: 'breezy', name: 'Breezy HR', domain: 'breezy.hr', category: 'mid_market', enabled: false },
];
