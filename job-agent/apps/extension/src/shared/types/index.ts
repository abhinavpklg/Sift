/**
 * Types module exports
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
  SavedResponse,
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

// Future exports:
// export * from './messages';
