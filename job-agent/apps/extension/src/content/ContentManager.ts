/**
 * ContentManager - Orchestrates form detection and filling
 */

import type { 
  ATSPlatform, 
  ContentState, 
  ContentEvents, 
  DetectedForm,
  FormFillResult 
} from './types';
import { getPlatformInfo, hasApplicationForm } from './platforms';
import { FormDetector } from './FormDetector';
import { AutoFiller } from './AutoFiller';
import type { MessageResponse } from '../background/types';
import type { UserProfile } from '../shared/types/profile';

export class ContentManager {
  private state: ContentState;
  private events: ContentEvents;
  private observer: MutationObserver | null = null;
  private formDetector: FormDetector | null = null;

  constructor(events: ContentEvents = {}) {
    this.events = events;
    this.state = {
      initialized: false,
      platform: 'unknown',
      isApplicationPage: false,
      currentForm: null,
      isFillingForm: false,
      lastFillResult: null,
    };
  }

  async initialize(): Promise<void> {
    if (this.state.initialized) return;
    console.log('[Sift] Initializing content manager...');

    const platformInfo = getPlatformInfo();
    this.state.platform = platformInfo.platform;
    this.state.isApplicationPage = platformInfo.isApplicationPage;

    console.log('[Sift] Platform:', {
      platform: this.state.platform,
      isApp: this.state.isApplicationPage,
    });

    await this.sendMessage({
      type: 'CONTENT_READY',
      payload: {
        url: window.location.href,
        platform: this.state.platform,
        isApplicationPage: this.state.isApplicationPage,
      },
    });

    this.setupPageMonitoring();
    
    if (this.state.isApplicationPage) {
      await this.detectFormWithRetry();
    }

    this.state.initialized = true;
    this.events.onReady?.();
    console.log('[Sift] Content manager initialized');
  }

  private setupPageMonitoring(): void {
    let lastUrl = window.location.href;
    
    this.observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.log('[Sift] URL changed:', lastUrl);
        this.handleUrlChange(lastUrl);
      }
    });
    
    this.observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', () => this.handleUrlChange(window.location.href));
  }

  private async handleUrlChange(url: string): Promise<void> {
    const platformInfo = getPlatformInfo(url);
    this.state.isApplicationPage = platformInfo.isApplicationPage;
    
    if (this.state.isApplicationPage) {
      this.state.currentForm = null;
      setTimeout(() => this.detectFormWithRetry(), 500);
    } else {
      this.state.currentForm = null;
      this.formDetector = null;
    }
  }

  private async detectFormWithRetry(maxAttempts = 10, delay = 500): Promise<void> {
    console.log('[Sift] Looking for form...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (hasApplicationForm(this.state.platform)) {
        console.log(`[Sift] Form container found (attempt ${attempt})`);
        await this.detectForm();
        
        if (this.state.currentForm && this.state.currentForm.fields.length > 0) {
          return;
        }
      }
      
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
    
    console.log('[Sift] No form found after', maxAttempts, 'attempts');
  }

  private async detectForm(): Promise<void> {
    this.formDetector = new FormDetector(this.state.platform);
    const form = this.formDetector.detect();

    if (!form || form.fields.length === 0) {
      console.log('[Sift] FormDetector found no fields');
      return;
    }

    this.state.currentForm = form;

    console.log('[Sift] Detected form:', {
      id: form.id,
      platform: form.platform,
      fieldCount: form.fields.length,
      requiredFields: form.fields.filter(f => f.required).length,
    });

    await this.sendMessage({
      type: 'FORM_DETECTED',
      payload: {
        url: form.url,
        platform: form.platform,
        fieldCount: form.fields.length,
      },
    });

    this.events.onFormDetected?.(form);
  }

  async fillForm(options?: { skipFilled?: boolean; onlyRequired?: boolean }): Promise<FormFillResult | null> {
    if (!this.state.currentForm) {
      console.log('[Sift] No form to fill');
      return null;
    }

    if (this.state.isFillingForm) {
      console.log('[Sift] Already filling form');
      return null;
    }

    this.state.isFillingForm = true;

    try {
      // Get active profile
      const profileResponse = await this.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
      
      if (!profileResponse.success || !profileResponse.data) {
        console.error('[Sift] No active profile found');
        this.state.isFillingForm = false;
        return null;
      }

      const profile = profileResponse.data as UserProfile;
      console.log('[Sift] Using profile:', profile.name);

      // Create filler and fill
      const filler = new AutoFiller(this.state.currentForm, profile, {
        skipFilled: options?.skipFilled ?? true,
        onlyRequired: options?.onlyRequired ?? false,
        delayBetweenFields: 50,
      });

      const result = await filler.fillAll();
      this.state.lastFillResult = result;
      this.events.onFormFilled?.(result);

      return result;
    } catch (error) {
      console.error('[Sift] Fill error:', error);
      this.events.onError?.(error instanceof Error ? error : new Error('Fill failed'));
      return null;
    } finally {
      this.state.isFillingForm = false;
    }
  }

  findNextButton(): HTMLElement | null {
    const selectors = [
      'button[type="submit"]:not([disabled])',
      'button:contains("Next")',
      'button:contains("Continue")',
      'input[type="submit"]',
      '[data-testid="next-button"]',
      '.btn-next',
      '.continue-btn',
    ];

    // Try common text patterns
    const buttons = document.querySelectorAll('button, input[type="submit"], a.btn');
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase() || '';
      if (text.includes('next') || text.includes('continue') || text.includes('proceed')) {
        if (!(btn as HTMLButtonElement).disabled) {
          return btn as HTMLElement;
        }
      }
    }

    // Try selectors
    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector) as HTMLElement;
        if (el) return el;
      } catch (e) {
        // Invalid selector, skip
      }
    }

    return null;
  }

  clickNextButton(): boolean {
    const btn = this.findNextButton();
    if (btn) {
      console.log('[Sift] Clicking next button:', btn.textContent?.trim());
      btn.click();
      return true;
    }
    console.log('[Sift] No next button found');
    return false;
  }

  private async sendMessage(message: { type: string; payload?: unknown }): Promise<MessageResponse> {
    try {
      return await chrome.runtime.sendMessage(message) as MessageResponse;
    } catch (e) {
      console.error('[Sift] Message failed:', e);
      return { success: false, error: 'Failed to send message' };
    }
  }

  // Public getters
  getState(): ContentState { return { ...this.state }; }
  getPlatform(): ATSPlatform { return this.state.platform; }
  isOnApplicationPage(): boolean { return this.state.isApplicationPage; }
  getCurrentForm(): DetectedForm | null { return this.state.currentForm; }
  getLastFillResult(): FormFillResult | null { return this.state.lastFillResult; }

  async refreshForm(): Promise<DetectedForm | null> {
    this.state.currentForm = null;
    await this.detectFormWithRetry();
    return this.state.currentForm;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.state.initialized = false;
  }
}

export default ContentManager;
