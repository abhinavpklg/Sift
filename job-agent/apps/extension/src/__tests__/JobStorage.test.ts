/**
 * JobStorage Unit Tests
 * STORAGE-003: Test suite for job tracking operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobStorage } from '../shared/storage/JobStorage';
import { generateUrlHash } from '../shared/types/job';

// Mock Chrome Storage API
const mockStorage: Record<string, unknown> = {};

const mockChromeStorage = {
  local: {
    get: vi.fn((keys) => {
      if (typeof keys === 'string') {
        return Promise.resolve({ [keys]: mockStorage[keys] });
      }
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        keys.forEach(k => { result[k] = mockStorage[k]; });
        return Promise.resolve(result);
      }
      return Promise.resolve(mockStorage);
    }),
    set: vi.fn((items) => {
      Object.assign(mockStorage, items);
      return Promise.resolve();
    }),
    remove: vi.fn((keys) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach(k => delete mockStorage[k]);
      return Promise.resolve();
    }),
  },
  onChanged: {
    addListener: vi.fn(),
  },
};

// @ts-expect-error - Mock chrome global
global.chrome = { storage: mockChromeStorage };

vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
});

describe('JobStorage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  describe('Scraped Jobs', () => {
    const sampleJob = {
      url: 'https://boards.greenhouse.io/company/jobs/123',
      title: 'Senior Engineer',
      company: 'Test Corp',
      location: 'Remote',
      description: 'Great job opportunity',
      summary: 'Engineering role',
      techStack: ['TypeScript', 'React'],
      postedDate: new Date().toISOString(),
      relevanceScore: 85,
      status: 'pending' as const,
      atsSource: 'greenhouse.io',
    };

    it('should add a scraped job', async () => {
      const job = await JobStorage.addScrapedJob(sampleJob);

      expect(job).not.toBeNull();
      expect(job?.title).toBe('Senior Engineer');
      expect(job?.id).toBeDefined();
      expect(job?.urlHash).toBeDefined();
    });

    it('should prevent duplicate jobs', async () => {
      await JobStorage.addScrapedJob(sampleJob);
      const duplicate = await JobStorage.addScrapedJob(sampleJob);

      expect(duplicate).toBeNull();

      const jobs = await JobStorage.getScrapedJobs();
      expect(jobs).toHaveLength(1);
    });

    it('should get job by URL', async () => {
      await JobStorage.addScrapedJob(sampleJob);
      const found = await JobStorage.getScrapedJobByUrl(sampleJob.url);

      expect(found).not.toBeNull();
      expect(found?.company).toBe('Test Corp');
    });

    it('should filter jobs by status', async () => {
      await JobStorage.addScrapedJob(sampleJob);
      await JobStorage.addScrapedJob({
        ...sampleJob,
        url: 'https://different.com/job/456',
        status: 'saved',
      });

      const pending = await JobStorage.getFilteredScrapedJobs({ status: 'pending' });
      expect(pending).toHaveLength(1);

      const saved = await JobStorage.getFilteredScrapedJobs({ status: 'saved' });
      expect(saved).toHaveLength(1);
    });

    it('should update job status', async () => {
      const job = await JobStorage.addScrapedJob(sampleJob);
      await JobStorage.updateScrapedJobStatus(job!.id, 'applied');

      const updated = await JobStorage.getScrapedJobById(job!.id);
      expect(updated?.status).toBe('applied');
    });

    it('should delete scraped job', async () => {
      const job = await JobStorage.addScrapedJob(sampleJob);
      const deleted = await JobStorage.deleteScrapedJob(job!.id);

      expect(deleted).toBe(true);

      const jobs = await JobStorage.getScrapedJobs();
      expect(jobs).toHaveLength(0);
    });

    it('should add jobs in batch', async () => {
      const jobs = [
        { ...sampleJob, url: 'https://site.com/job/1' },
        { ...sampleJob, url: 'https://site.com/job/2' },
        { ...sampleJob, url: 'https://site.com/job/1' }, // duplicate
      ];

      const result = await JobStorage.addScrapedJobsBatch(jobs);

      expect(result.added).toBe(2);
      expect(result.duplicates).toBe(1);
    });

    it('should search jobs by query', async () => {
      await JobStorage.addScrapedJob(sampleJob);
      await JobStorage.addScrapedJob({
        ...sampleJob,
        url: 'https://other.com/job',
        title: 'Product Manager',
        techStack: ['Jira', 'Analytics'],
      });

      const results = await JobStorage.getFilteredScrapedJobs({ 
        searchQuery: 'TypeScript' 
      });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Senior Engineer');
    });
  });

  describe('Applied Jobs', () => {
    const sampleAppliedJob = {
      profileId: 'profile-123',
      url: 'https://boards.greenhouse.io/company/jobs/123',
      title: 'Senior Engineer',
      company: 'Test Corp',
      notes: 'Applied via website',
    };

    it('should mark job as applied', async () => {
      const job = await JobStorage.markAsApplied(sampleAppliedJob);

      expect(job.id).toBeDefined();
      expect(job.status).toBe('applied');
      expect(job.appliedAt).toBeDefined();
    });

    it('should detect already applied URLs', async () => {
      await JobStorage.markAsApplied(sampleAppliedJob);
      const isApplied = await JobStorage.isUrlApplied(sampleAppliedJob.url);

      expect(isApplied).toBe(true);
    });

    it('should not duplicate applied jobs', async () => {
      await JobStorage.markAsApplied(sampleAppliedJob);
      await JobStorage.markAsApplied(sampleAppliedJob);

      const jobs = await JobStorage.getAppliedJobs();
      expect(jobs).toHaveLength(1);
    });

    it('should update application status', async () => {
      const job = await JobStorage.markAsApplied(sampleAppliedJob);
      await JobStorage.updateApplicationStatus(job.id, 'interview', 'Phone screen scheduled');

      const updated = await JobStorage.getAppliedJobByUrl(sampleAppliedJob.url);
      expect(updated?.status).toBe('interview');
      expect(updated?.notes).toBe('Phone screen scheduled');
    });

    it('should get today applied jobs', async () => {
      await JobStorage.markAsApplied(sampleAppliedJob);

      const todayJobs = await JobStorage.getTodayAppliedJobs();
      expect(todayJobs).toHaveLength(1);
    });

    it('should filter by profile', async () => {
      await JobStorage.markAsApplied(sampleAppliedJob);
      await JobStorage.markAsApplied({
        ...sampleAppliedJob,
        url: 'https://other.com/job',
        profileId: 'profile-456',
      });

      const filtered = await JobStorage.getFilteredAppliedJobs({ 
        profileId: 'profile-123' 
      });
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', async () => {
      await JobStorage.addScrapedJob({
        url: 'https://site.com/job/1',
        title: 'Job 1',
        company: 'Co',
        location: '',
        description: '',
        summary: '',
        techStack: [],
        postedDate: new Date().toISOString(),
        relevanceScore: 50,
        status: 'pending',
        atsSource: 'greenhouse.io',
      });

      await JobStorage.markAsApplied({
        profileId: 'p1',
        url: 'https://site.com/job/2',
        title: 'Job 2',
        company: 'Co',
        notes: '',
      });

      const stats = await JobStorage.getStats();

      expect(stats.total).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.todayApplied).toBe(1);
    });

    it('should get today count', async () => {
      await JobStorage.markAsApplied({
        profileId: 'p1',
        url: 'https://site.com/job/1',
        title: 'Job',
        company: 'Co',
        notes: '',
      });

      const count = await JobStorage.getTodayCount();
      expect(count).toBe(1);
    });
  });

  describe('URL Handling', () => {
    it('should normalize URLs with tracking params', () => {
      const url1 = 'https://jobs.lever.co/company/123?utm_source=linkedin';
      const url2 = 'https://jobs.lever.co/company/123';

      const hash1 = generateUrlHash(url1);
      const hash2 = generateUrlHash(url2);

      expect(hash1).toBe(hash2);
    });

    it('should handle trailing slashes', () => {
      const url1 = 'https://boards.greenhouse.io/company/jobs/123/';
      const url2 = 'https://boards.greenhouse.io/company/jobs/123';

      const hash1 = generateUrlHash(url1);
      const hash2 = generateUrlHash(url2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Export', () => {
    it('should export applied jobs as JSON', async () => {
      await JobStorage.markAsApplied({
        profileId: 'p1',
        url: 'https://site.com/job',
        title: 'Engineer',
        company: 'Corp',
        notes: 'Test',
      });

      const exported = await JobStorage.exportAppliedJobs();
      const parsed = JSON.parse(exported);

      expect(parsed.jobs).toHaveLength(1);
      expect(parsed.version).toBe('1.0');
    });

    it('should export as CSV', async () => {
      await JobStorage.markAsApplied({
        profileId: 'p1',
        url: 'https://site.com/job',
        title: 'Engineer',
        company: 'Test Corp',
        notes: 'Applied',
      });

      const csv = await JobStorage.exportAppliedJobsAsCsv();

      expect(csv).toContain('Title,Company,URL');
      expect(csv).toContain('Engineer');
      expect(csv).toContain('Test Corp');
    });
  });
});
