/**
 * Job Types for Sift Chrome Extension
 * STORAGE-003: Type definitions for scraped and applied jobs
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
  salary?: string;
  postedDate: string;
  postedAgo: string;
  relevanceScore: number;
  status: JobStatus;
  atsSource: string;
  scrapedAt: string;
  updatedAt: string;
}

export interface AppliedJob {
  id: string;
  profileId: string;
  url: string;
  urlHash: string;
  title: string;
  company: string;
  location?: string;
  appliedAt: string;
  status: ApplicationStatus;
  notes: string;
  resumeUsed?: string;
  followUpDate?: string;
}

export type JobStatus = 'pending' | 'applied' | 'skipped' | 'saved' | 'expired';

export type ApplicationStatus = 
  | 'applied' 
  | 'screening' 
  | 'interview' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn'
  | 'no_response';

export interface JobFilter {
  status?: JobStatus | JobStatus[];
  atsSource?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  minRelevanceScore?: number;
  searchQuery?: string;
}

export interface AppliedJobFilter {
  profileId?: string;
  status?: ApplicationStatus | ApplicationStatus[];
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface JobStats {
  total: number;
  pending: number;
  applied: number;
  skipped: number;
  saved: number;
  todayApplied: number;
  thisWeekApplied: number;
}

/**
 * Generate URL hash for duplicate detection
 */
export function generateUrlHash(url: string): string {
  // Normalize URL: remove tracking params, trailing slashes, etc.
  const normalized = normalizeJobUrl(url);
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Normalize job URL for consistent comparison
 */
export function normalizeJobUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'source', 'fbclid', 'gclid', 'mc_cid', 'mc_eid'
    ];
    
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    
    // Remove trailing slash
    let normalized = parsed.origin + parsed.pathname.replace(/\/$/, '');
    
    // Add remaining search params if any
    if (parsed.searchParams.toString()) {
      normalized += '?' + parsed.searchParams.toString();
    }
    
    return normalized.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Calculate "posted ago" string from date
 */
export function getPostedAgo(postedDate: string): string {
  const posted = new Date(postedDate);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Create empty scraped job template
 */
export function createEmptyScrapedJob(url: string): Omit<ScrapedJob, 'id' | 'scrapedAt' | 'updatedAt'> {
  return {
    url,
    urlHash: generateUrlHash(url),
    title: '',
    company: '',
    location: '',
    description: '',
    summary: '',
    techStack: [],
    postedDate: new Date().toISOString(),
    postedAgo: 'Just now',
    relevanceScore: 0,
    status: 'pending',
    atsSource: '',
  };
}
