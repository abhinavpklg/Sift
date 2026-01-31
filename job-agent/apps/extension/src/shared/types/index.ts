/**
 * Types module exports - Complete Types
 */

// Profile types
export type {
  UserProfile,
  PersonalInfo,
  Address,
  Education,
  WorkExperience,
  Skills,
  LanguageProficiency,
  Documents,
  EmploymentInfo,
  SavedResponse as ProfileSavedResponse,
} from './profile';
export { createEmptyProfile } from './profile';

// Settings types
export type {
  UserSettings,
  GeneralSettings,
  ScrapingSettings,
  LLMSettings,
  EncryptedCredential,
  SettingsUpdate,
  ATSPlatformId,
} from './settings';
export { DEFAULT_SETTINGS, SETTINGS_VERSION, ATS_PLATFORMS } from './settings';

// Job types
export type {
  ScrapedJob,
  AppliedJob,
  JobStatus,
  ApplicationStatus,
  JobFilter,
  AppliedJobFilter,
  JobStats,
} from './job';
export { 
  generateUrlHash, 
  normalizeJobUrl, 
  getPostedAgo, 
  createEmptyScrapedJob 
} from './job';

// Response types
export type {
  SavedResponse,
  ResponseCategory,
  ResponseSource,
  ResponseFilter,
  ResponseMatch,
} from './response';
export {
  QUESTION_PATTERNS,
  detectCategory,
  extractKeywords,
  normalizeQuestion,
  calculateSimilarity,
} from './response';
