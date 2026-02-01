/**
 * Badge Manager - Extension badge showing today's application count
 */

import { JobStorage } from '../shared/storage/JobStorage';
import { SettingsStorage } from '../shared/storage/SettingsStorage';

interface BadgeState {
  count: number;
  goal: number;
  lastUpdated: number;
}

const BADGE_COLORS = {
  zero: '#6B7280',
  progress: '#3B82F6',
  good: '#F59E0B',
  complete: '#10B981',
} as const;

export class BadgeManager {
  private state: BadgeState = { count: 0, goal: 10, lastUpdated: 0 };
  private readonly CACHE_DURATION = 30 * 1000;

  async initialize(): Promise<void> {
    console.log('[Sift] Initializing badge manager...');
    await this.loadGoal();
    await this.refreshCount();
    this.setupStorageListener();
    console.log('[Sift] Badge manager initialized');
  }

  private async loadGoal(): Promise<void> {
    try {
      const settings = await SettingsStorage.getAll();
      this.state.goal = settings.general.dailyGoal || 10;
    } catch {
      this.state.goal = 10;
    }
  }

  async setGoal(goal: number): Promise<void> {
    this.state.goal = Math.max(1, goal);
    await this.updateBadge();
  }

  async getCount(): Promise<number> {
    if (Date.now() - this.state.lastUpdated < this.CACHE_DURATION) {
      return this.state.count;
    }
    await this.refreshCount();
    return this.state.count;
  }

  async refreshCount(): Promise<void> {
    try {
      const stats = await JobStorage.getStats();
      this.state.count = stats.todayApplied;
      this.state.lastUpdated = Date.now();
      await this.updateBadge();
    } catch (error) {
      console.error('[Sift] Failed to refresh badge count:', error);
    }
  }

  async incrementCount(): Promise<void> {
    this.state.count++;
    this.state.lastUpdated = Date.now();
    await this.updateBadge();
  }

  private async updateBadge(): Promise<void> {
    const { count, goal } = this.state;
    await this.setBadgeText(count);
    await this.setBadgeColor(this.getColorForProgress(count, goal));
    await this.setBadgeTitle(count, goal);
  }

  private async setBadgeText(count: number): Promise<void> {
    try {
      await chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    } catch (error) {
      console.error('[Sift] Failed to set badge text:', error);
    }
  }

  private async setBadgeColor(color: string): Promise<void> {
    try {
      await chrome.action.setBadgeBackgroundColor({ color });
    } catch (error) {
      console.error('[Sift] Failed to set badge color:', error);
    }
  }

  private async setBadgeTitle(count: number, goal: number): Promise<void> {
    try {
      const title = count === 0
        ? 'Sift - No applications today'
        : count >= goal
          ? `Sift - Goal reached! ${count}/${goal} applications`
          : `Sift - ${count}/${goal} applications today`;
      await chrome.action.setTitle({ title });
    } catch (error) {
      console.error('[Sift] Failed to set badge title:', error);
    }
  }

  private getColorForProgress(count: number, goal: number): string {
    if (count === 0) return BADGE_COLORS.zero;
    const progress = count / goal;
    if (progress >= 1) return BADGE_COLORS.complete;
    if (progress >= 0.5) return BADGE_COLORS.good;
    return BADGE_COLORS.progress;
  }

  private setupStorageListener(): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;
      if (changes['sift_applied_jobs']) this.refreshCount();
      if (changes['sift_settings']) {
        const newSettings = changes['sift_settings'].newValue;
        if (newSettings?.general?.dailyGoal !== this.state.goal) {
          this.state.goal = newSettings.general.dailyGoal;
          this.updateBadge();
        }
      }
    });
  }

  async clearBadge(): Promise<void> {
    await chrome.action.setBadgeText({ text: '' });
  }

  getState(): BadgeState {
    return { ...this.state };
  }
}

export default BadgeManager;
