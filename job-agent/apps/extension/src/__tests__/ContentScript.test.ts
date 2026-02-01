import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockChrome = { runtime: { sendMessage: vi.fn().mockResolvedValue({ success: true }) } };
vi.stubGlobal('chrome', mockChrome);

import { detectPlatform, isApplicationPage, getPlatformInfo } from '../content/platforms';

describe('Platform Detection', () => {
  describe('detectPlatform', () => {
    it('should detect Greenhouse', () => {
      expect(detectPlatform('https://boards.greenhouse.io/company/jobs/123')).toBe('greenhouse');
      expect(detectPlatform('https://jobs.greenhouse.io/company')).toBe('greenhouse');
    });
    it('should detect Lever', () => {
      expect(detectPlatform('https://jobs.lever.co/company/123')).toBe('lever');
      expect(detectPlatform('https://company.lever.co/apply/456')).toBe('lever');
    });
    it('should detect Ashby', () => {
      expect(detectPlatform('https://jobs.ashbyhq.com/company')).toBe('ashby');
    });
    it('should detect Workday', () => {
      expect(detectPlatform('https://company.myworkdayjobs.com/careers')).toBe('workday');
    });
    it('should detect iCIMS', () => {
      expect(detectPlatform('https://careers.icims.com/jobs/123')).toBe('icims');
    });
    it('should detect SmartRecruiters', () => {
      expect(detectPlatform('https://jobs.smartrecruiters.com/company')).toBe('smartrecruiters');
    });
    it('should detect Jobvite', () => {
      expect(detectPlatform('https://jobs.jobvite.com/company/job/123')).toBe('jobvite');
    });
    it('should detect BambooHR', () => {
      expect(detectPlatform('https://company.bamboohr.com/jobs')).toBe('bamboohr');
    });
    it('should detect Breezy', () => {
      expect(detectPlatform('https://company.breezy.hr/p/abc123')).toBe('breezy');
    });
    it('should detect Workable', () => {
      expect(detectPlatform('https://apply.workable.com/company/j/abc123')).toBe('workable');
    });
    it('should return unknown for non-ATS', () => {
      expect(detectPlatform('https://google.com')).toBe('unknown');
      expect(detectPlatform('https://linkedin.com/jobs')).toBe('unknown');
    });
  });

  describe('isApplicationPage', () => {
    it('should detect Greenhouse app pages', () => {
      expect(isApplicationPage('https://boards.greenhouse.io/company/jobs/123', 'greenhouse')).toBe(true);
      expect(isApplicationPage('https://boards.greenhouse.io/company', 'greenhouse')).toBe(false);
    });
    it('should detect Lever app pages', () => {
      expect(isApplicationPage('https://jobs.lever.co/company/123/apply', 'lever')).toBe(true);
    });
  });

  describe('getPlatformInfo', () => {
    it('should return platform info', () => {
      const info = getPlatformInfo('https://boards.greenhouse.io/company/jobs/123');
      expect(info.platform).toBe('greenhouse');
      expect(info.isApplicationPage).toBe(true);
    });
  });
});

describe('ContentManager', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should import ContentManager', async () => {
    const { ContentManager } = await import('../content/ContentManager');
    expect(ContentManager).toBeDefined();
  });
  it('should create instance', async () => {
    const { ContentManager } = await import('../content/ContentManager');
    const m = new ContentManager();
    expect(m.getPlatform()).toBe('unknown');
    expect(m.isOnApplicationPage()).toBe(false);
  });
  it('should have getState', async () => {
    const { ContentManager } = await import('../content/ContentManager');
    const m = new ContentManager();
    const s = m.getState();
    expect(s).toHaveProperty('initialized', false);
    expect(s).toHaveProperty('platform');
  });
});

describe('URL Edge Cases', () => {
  it('should handle query params', () => {
    expect(detectPlatform('https://boards.greenhouse.io/company/jobs/123?source=linkedin')).toBe('greenhouse');
  });
  it('should handle uppercase', () => {
    expect(detectPlatform('https://BOARDS.GREENHOUSE.IO/company')).toBe('greenhouse');
  });
  it('should handle subdomains', () => {
    expect(detectPlatform('https://careers.company.lever.co/job')).toBe('lever');
  });
});
