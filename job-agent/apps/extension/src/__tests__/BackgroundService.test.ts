/**
 * Background Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockChrome = {
  runtime: { onMessage: { addListener: vi.fn() }, onInstalled: { addListener: vi.fn() }, onStartup: { addListener: vi.fn() }, getPlatformInfo: vi.fn((cb) => cb && cb({ os: 'mac', arch: 'arm' })) },
  action: { setBadgeText: vi.fn().mockResolvedValue(undefined), setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined), setTitle: vi.fn().mockResolvedValue(undefined) },
  alarms: { create: vi.fn(), onAlarm: { addListener: vi.fn() } },
  tabs: { onUpdated: { addListener: vi.fn() } },
  storage: { local: { get: vi.fn().mockResolvedValue({}), set: vi.fn().mockResolvedValue(undefined) }, onChanged: { addListener: vi.fn() } },
};

vi.stubGlobal('chrome', mockChrome);

import { BadgeManager } from '../background/BadgeManager';

describe('BadgeManager', () => {
  let badgeManager: BadgeManager;

  beforeEach(() => {
    vi.clearAllMocks();
    badgeManager = new BadgeManager();
  });

  it('should create instance', () => {
    expect(badgeManager).toBeDefined();
  });

  it('should have initial state', () => {
    const state = badgeManager.getState();
    expect(state.count).toBe(0);
    expect(state.goal).toBe(10);
  });

  it('should update goal', async () => {
    await badgeManager.setGoal(20);
    expect(badgeManager.getState().goal).toBe(20);
  });

  it('should enforce minimum goal of 1', async () => {
    await badgeManager.setGoal(0);
    expect(badgeManager.getState().goal).toBe(1);
  });

  it('should increment count', async () => {
    await badgeManager.incrementCount();
    expect(badgeManager.getState().count).toBe(1);
  });

  it('should clear badge', async () => {
    await badgeManager.clearBadge();
    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
  });
});

describe('ATS Site Detection', () => {
  const checkIfATSSite = (url: string): boolean => {
    const patterns = ['greenhouse.io', 'lever.co', 'ashbyhq.com', 'workday', 'icims.com', 'smartrecruiters.com', 'jobvite.com', 'bamboohr.com', 'breezy.hr', 'workable.com'];
    return patterns.some((p) => url.includes(p));
  };

  it('should detect Greenhouse URLs', () => {
    expect(checkIfATSSite('https://boards.greenhouse.io/company/jobs/123')).toBe(true);
  });

  it('should detect Lever URLs', () => {
    expect(checkIfATSSite('https://jobs.lever.co/company/123')).toBe(true);
  });

  it('should not detect non-ATS URLs', () => {
    expect(checkIfATSSite('https://google.com')).toBe(false);
  });
});

describe('Badge Color Logic', () => {
  const COLORS = { zero: '#6B7280', progress: '#3B82F6', good: '#F59E0B', complete: '#10B981' };
  const getColor = (count: number, goal: number): string => {
    if (count === 0) return COLORS.zero;
    const p = count / goal;
    if (p >= 1) return COLORS.complete;
    if (p >= 0.5) return COLORS.good;
    return COLORS.progress;
  };

  it('should return gray for zero', () => expect(getColor(0, 10)).toBe('#6B7280'));
  it('should return blue for low progress', () => expect(getColor(2, 10)).toBe('#3B82F6'));
  it('should return amber for good progress', () => expect(getColor(5, 10)).toBe('#F59E0B'));
  it('should return green when complete', () => expect(getColor(10, 10)).toBe('#10B981'));
});
