/**
 * JobStorage - Chrome Storage API wrapper for job tracking
 * STORAGE-003: Scraped jobs queue and applied jobs history
 */

import type { 
  ScrapedJob, 
  AppliedJob, 
  JobStatus, 
  ApplicationStatus,
  JobFilter,
  AppliedJobFilter,
  JobStats
} from '../types/job';
import { generateUrlHash, getPostedAgo } from '../types/job';

const STORAGE_KEYS = {
  SCRAPED_JOBS: 'sift_scraped_jobs',
  APPLIED_JOBS: 'sift_applied_jobs',
  DAILY_STATS: 'sift_daily_stats',
} as const;

export interface JobStorageEvents {
  onScrapedJobsChanged?: (jobs: ScrapedJob[]) => void;
  onAppliedJobsChanged?: (jobs: AppliedJob[]) => void;
  onStatsChanged?: (stats: JobStats) => void;
}

/**
 * JobStorage Class
 * Manages scraped jobs queue and applied jobs tracking
 */
export class JobStorage {
  private static listeners: JobStorageEvents = {};
  private static initialized = false;

  /**
   * Initialize with change listeners
   */
  static init(events?: JobStorageEvents): void {
    if (this.initialized) return;

    if (events) {
      this.listeners = events;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      if (changes[STORAGE_KEYS.SCRAPED_JOBS]) {
        const jobs = (changes[STORAGE_KEYS.SCRAPED_JOBS].newValue as ScrapedJob[]) || [];
        this.listeners.onScrapedJobsChanged?.(jobs);
      }

      if (changes[STORAGE_KEYS.APPLIED_JOBS]) {
        const jobs = (changes[STORAGE_KEYS.APPLIED_JOBS].newValue as AppliedJob[]) || [];
        this.listeners.onAppliedJobsChanged?.(jobs);
      }
    });

    this.initialized = true;
  }

  // ============================================
  // Scraped Jobs - READ
  // ============================================

  /**
   * Get all scraped jobs
   */
  static async getScrapedJobs(): Promise<ScrapedJob[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SCRAPED_JOBS);
    return (result[STORAGE_KEYS.SCRAPED_JOBS] as ScrapedJob[]) || [];
  }

  /**
   * Get scraped job by ID
   */
  static async getScrapedJobById(jobId: string): Promise<ScrapedJob | null> {
    const jobs = await this.getScrapedJobs();
    return jobs.find(j => j.id === jobId) || null;
  }

  /**
   * Get scraped job by URL
   */
  static async getScrapedJobByUrl(url: string): Promise<ScrapedJob | null> {
    const urlHash = generateUrlHash(url);
    const jobs = await this.getScrapedJobs();
    return jobs.find(j => j.urlHash === urlHash) || null;
  }

  /**
   * Get filtered scraped jobs
   */
  static async getFilteredScrapedJobs(filter: JobFilter): Promise<ScrapedJob[]> {
    let jobs = await this.getScrapedJobs();

    // Filter by status
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      jobs = jobs.filter(j => statuses.includes(j.status));
    }

    // Filter by ATS source
    if (filter.atsSource) {
      const sources = Array.isArray(filter.atsSource) ? filter.atsSource : [filter.atsSource];
      jobs = jobs.filter(j => sources.includes(j.atsSource));
    }

    // Filter by date range
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      jobs = jobs.filter(j => new Date(j.scrapedAt).getTime() >= from);
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime();
      jobs = jobs.filter(j => new Date(j.scrapedAt).getTime() <= to);
    }

    // Filter by relevance score
    if (filter.minRelevanceScore !== undefined) {
      jobs = jobs.filter(j => j.relevanceScore >= filter.minRelevanceScore!);
    }

    // Search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        j.techStack.some(t => t.toLowerCase().includes(query))
      );
    }

    return jobs;
  }

  /**
   * Get pending jobs (job queue)
   */
  static async getPendingJobs(): Promise<ScrapedJob[]> {
    return this.getFilteredScrapedJobs({ status: 'pending' });
  }

  // ============================================
  // Scraped Jobs - WRITE
  // ============================================

  /**
   * Add a new scraped job
   */
  static async addScrapedJob(
    jobData: Omit<ScrapedJob, 'id' | 'urlHash' | 'scrapedAt' | 'updatedAt' | 'postedAgo'>
  ): Promise<ScrapedJob | null> {
    const jobs = await this.getScrapedJobs();
    const urlHash = generateUrlHash(jobData.url);

    // Check for duplicate
    if (jobs.some(j => j.urlHash === urlHash)) {
      return null; // Already exists
    }

    const now = new Date().toISOString();
    const newJob: ScrapedJob = {
      ...jobData,
      id: crypto.randomUUID(),
      urlHash,
      postedAgo: getPostedAgo(jobData.postedDate),
      scrapedAt: now,
      updatedAt: now,
    };

    jobs.unshift(newJob); // Add to beginning
    await chrome.storage.local.set({ [STORAGE_KEYS.SCRAPED_JOBS]: jobs });

    return newJob;
  }

  /**
   * Add multiple scraped jobs (batch)
   */
  static async addScrapedJobsBatch(
    jobsData: Omit<ScrapedJob, 'id' | 'urlHash' | 'scrapedAt' | 'updatedAt' | 'postedAgo'>[]
  ): Promise<{ added: number; duplicates: number }> {
    const existingJobs = await this.getScrapedJobs();
    const existingHashes = new Set(existingJobs.map(j => j.urlHash));

    const now = new Date().toISOString();
    let added = 0;
    let duplicates = 0;

    const newJobs: ScrapedJob[] = [];

    for (const jobData of jobsData) {
      const urlHash = generateUrlHash(jobData.url);
      
      if (existingHashes.has(urlHash)) {
        duplicates++;
        continue;
      }

      existingHashes.add(urlHash);
      newJobs.push({
        ...jobData,
        id: crypto.randomUUID(),
        urlHash,
        postedAgo: getPostedAgo(jobData.postedDate),
        scrapedAt: now,
        updatedAt: now,
      });
      added++;
    }

    if (newJobs.length > 0) {
      const allJobs = [...newJobs, ...existingJobs];
      await chrome.storage.local.set({ [STORAGE_KEYS.SCRAPED_JOBS]: allJobs });
    }

    return { added, duplicates };
  }

  /**
   * Update scraped job status
   */
  static async updateScrapedJobStatus(jobId: string, status: JobStatus): Promise<boolean> {
    const jobs = await this.getScrapedJobs();
    const index = jobs.findIndex(j => j.id === jobId);

    if (index === -1) return false;

    jobs[index].status = status;
    jobs[index].updatedAt = new Date().toISOString();

    await chrome.storage.local.set({ [STORAGE_KEYS.SCRAPED_JOBS]: jobs });
    return true;
  }

  /**
   * Update scraped job
   */
  static async updateScrapedJob(
    jobId: string, 
    updates: Partial<Omit<ScrapedJob, 'id' | 'urlHash' | 'scrapedAt'>>
  ): Promise<ScrapedJob | null> {
    const jobs = await this.getScrapedJobs();
    const index = jobs.findIndex(j => j.id === jobId);

    if (index === -1) return null;

    jobs[index] = {
      ...jobs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await chrome.storage.local.set({ [STORAGE_KEYS.SCRAPED_JOBS]: jobs });
    return jobs[index];
  }

  /**
   * Delete scraped job
   */
  static async deleteScrapedJob(jobId: string): Promise<boolean> {
    const jobs = await this.getScrapedJobs();
    const filtered = jobs.filter(j => j.id !== jobId);

    if (filtered.length === jobs.length) return false;

    await chrome.storage.local.set({ [STORAGE_KEYS.SCRAPED_JOBS]: filtered });
    return true;
  }

  /**
   * Clear old scraped jobs
   */
  static async clearOldScrapedJobs(olderThanDays: number = 30): Promise<number> {
    const jobs = await this.getScrapedJobs();
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    const filtered = jobs.filter(j => 
      new Date(j.scrapedAt).getTime() > cutoff || j.status === 'saved'
    );

    const removed = jobs.length - filtered.length;
    await chrome.storage.local.set({ [STORAGE_KEYS.SCRAPED_JOBS]: filtered });

    return removed;
  }

  // ============================================
  // Applied Jobs - READ
  // ============================================

  /**
   * Get all applied jobs
   */
  static async getAppliedJobs(): Promise<AppliedJob[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.APPLIED_JOBS);
    return (result[STORAGE_KEYS.APPLIED_JOBS] as AppliedJob[]) || [];
  }

  /**
   * Get applied job by URL
   */
  static async getAppliedJobByUrl(url: string): Promise<AppliedJob | null> {
    const urlHash = generateUrlHash(url);
    const jobs = await this.getAppliedJobs();
    return jobs.find(j => j.urlHash === urlHash) || null;
  }

  /**
   * Check if URL was already applied
   */
  static async isUrlApplied(url: string): Promise<boolean> {
    const job = await this.getAppliedJobByUrl(url);
    return job !== null;
  }

  /**
   * Get filtered applied jobs
   */
  static async getFilteredAppliedJobs(filter: AppliedJobFilter): Promise<AppliedJob[]> {
    let jobs = await this.getAppliedJobs();

    if (filter.profileId) {
      jobs = jobs.filter(j => j.profileId === filter.profileId);
    }

    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      jobs = jobs.filter(j => statuses.includes(j.status));
    }

    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      jobs = jobs.filter(j => new Date(j.appliedAt).getTime() >= from);
    }

    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime();
      jobs = jobs.filter(j => new Date(j.appliedAt).getTime() <= to);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.notes.toLowerCase().includes(query)
      );
    }

    return jobs;
  }

  /**
   * Get applied jobs for today
   */
  static async getTodayAppliedJobs(): Promise<AppliedJob[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getFilteredAppliedJobs({ dateFrom: today.toISOString() });
  }

  // ============================================
  // Applied Jobs - WRITE
  // ============================================

  /**
   * Mark job as applied
   */
  static async markAsApplied(
    jobData: Omit<AppliedJob, 'id' | 'urlHash' | 'appliedAt' | 'status'>
  ): Promise<AppliedJob> {
    const jobs = await this.getAppliedJobs();
    const urlHash = generateUrlHash(jobData.url);

    // Check if already applied
    const existingIndex = jobs.findIndex(j => j.urlHash === urlHash);
    
    const appliedJob: AppliedJob = {
      ...jobData,
      id: existingIndex >= 0 ? jobs[existingIndex].id : crypto.randomUUID(),
      urlHash,
      appliedAt: existingIndex >= 0 ? jobs[existingIndex].appliedAt : new Date().toISOString(),
      status: 'applied',
    };

    if (existingIndex >= 0) {
      jobs[existingIndex] = appliedJob;
    } else {
      jobs.unshift(appliedJob);
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.APPLIED_JOBS]: jobs });

    // Also update scraped job status if exists
    const scrapedJob = await this.getScrapedJobByUrl(jobData.url);
    if (scrapedJob) {
      await this.updateScrapedJobStatus(scrapedJob.id, 'applied');
    }

    return appliedJob;
  }

  /**
   * Update applied job status
   */
  static async updateApplicationStatus(
    jobId: string, 
    status: ApplicationStatus,
    notes?: string
  ): Promise<boolean> {
    const jobs = await this.getAppliedJobs();
    const index = jobs.findIndex(j => j.id === jobId);

    if (index === -1) return false;

    jobs[index].status = status;
    if (notes !== undefined) {
      jobs[index].notes = notes;
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.APPLIED_JOBS]: jobs });
    return true;
  }

  /**
   * Update applied job notes
   */
  static async updateAppliedJobNotes(jobId: string, notes: string): Promise<boolean> {
    const jobs = await this.getAppliedJobs();
    const index = jobs.findIndex(j => j.id === jobId);

    if (index === -1) return false;

    jobs[index].notes = notes;
    await chrome.storage.local.set({ [STORAGE_KEYS.APPLIED_JOBS]: jobs });
    return true;
  }

  /**
   * Set follow-up date
   */
  static async setFollowUpDate(jobId: string, date: string): Promise<boolean> {
    const jobs = await this.getAppliedJobs();
    const index = jobs.findIndex(j => j.id === jobId);

    if (index === -1) return false;

    jobs[index].followUpDate = date;
    await chrome.storage.local.set({ [STORAGE_KEYS.APPLIED_JOBS]: jobs });
    return true;
  }

  /**
   * Delete applied job record
   */
  static async deleteAppliedJob(jobId: string): Promise<boolean> {
    const jobs = await this.getAppliedJobs();
    const filtered = jobs.filter(j => j.id !== jobId);

    if (filtered.length === jobs.length) return false;

    await chrome.storage.local.set({ [STORAGE_KEYS.APPLIED_JOBS]: filtered });
    return true;
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get job statistics
   */
  static async getStats(): Promise<JobStats> {
    const scrapedJobs = await this.getScrapedJobs();
    const appliedJobs = await this.getAppliedJobs();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoMs = weekAgo.getTime();

    const todayApplied = appliedJobs.filter(j => 
      new Date(j.appliedAt).getTime() >= todayMs
    ).length;

    const thisWeekApplied = appliedJobs.filter(j =>
      new Date(j.appliedAt).getTime() >= weekAgoMs
    ).length;

    return {
      total: scrapedJobs.length,
      pending: scrapedJobs.filter(j => j.status === 'pending').length,
      applied: scrapedJobs.filter(j => j.status === 'applied').length,
      skipped: scrapedJobs.filter(j => j.status === 'skipped').length,
      saved: scrapedJobs.filter(j => j.status === 'saved').length,
      todayApplied,
      thisWeekApplied,
    };
  }

  /**
   * Get today's application count
   */
  static async getTodayCount(): Promise<number> {
    const todayJobs = await this.getTodayAppliedJobs();
    return todayJobs.length;
  }

  // ============================================
  // Export/Import
  // ============================================

  /**
   * Export applied jobs history
   */
  static async exportAppliedJobs(): Promise<string> {
    const jobs = await this.getAppliedJobs();
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      jobs,
    }, null, 2);
  }

  /**
   * Export as CSV
   */
  static async exportAppliedJobsAsCsv(): Promise<string> {
    const jobs = await this.getAppliedJobs();
    
    const headers = ['Title', 'Company', 'URL', 'Applied Date', 'Status', 'Notes'];
    const rows = jobs.map(j => [
      `"${j.title.replace(/"/g, '""')}"`,
      `"${j.company.replace(/"/g, '""')}"`,
      j.url,
      j.appliedAt,
      j.status,
      `"${j.notes.replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Clear all data (use with caution!)
   */
  static async clearAll(): Promise<void> {
    await chrome.storage.local.remove([
      STORAGE_KEYS.SCRAPED_JOBS,
      STORAGE_KEYS.APPLIED_JOBS,
    ]);
  }
}

export default JobStorage;
