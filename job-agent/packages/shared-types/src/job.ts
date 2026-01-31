/**
 * Job Types
 * Represents scraped jobs and application tracking
 */

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
  salary?: SalaryInfo;
  postedDate: string;
  postedAgo: string;
  relevanceScore: number;
  status: ScrapedJobStatus;
  scrapedAt: string;
  atsSource: string;
}

export type ScrapedJobStatus = 'pending' | 'applied' | 'skipped' | 'saved';

export interface SalaryInfo {
  min?: number;
  max?: number;
  currency: string;
  period: 'hourly' | 'yearly';
}

export interface AppliedJob {
  id: string;
  profileId: string;
  url: string;
  urlHash: string;
  title: string;
  company: string;
  appliedAt: string;
  status: AppliedJobStatus;
  notes: string;
  followUpDate?: string;
}

export type AppliedJobStatus = 
  | 'applied' 
  | 'screening' 
  | 'interview' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn';

export interface JobStats {
  appliedToday: number;
  dailyGoal: number;
  totalApplied: number;
  appliedThisWeek: number;
  appliedThisMonth: number;
  responseRate: number;
}

// Default stats
export const DEFAULT_JOB_STATS: JobStats = {
  appliedToday: 0,
  dailyGoal: 10,
  totalApplied: 0,
  appliedThisWeek: 0,
  appliedThisMonth: 0,
  responseRate: 0,
};

// Job filter/sort options
export interface JobFilters {
  status?: ScrapedJobStatus[];
  atsSource?: string[];
  minRelevanceScore?: number;
  postedWithinHours?: number;
  searchQuery?: string;
}

export type JobSortField = 'postedDate' | 'relevanceScore' | 'company' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface JobSortOptions {
  field: JobSortField;
  direction: SortDirection;
}
