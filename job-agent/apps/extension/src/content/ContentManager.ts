/**
 * Content Manager - Manages content script lifecycle
 */

import type { ContentState, ContentEvents, ATSPlatform } from './types';
import { getPlatformInfo, hasApplicationForm } from './platforms';
import type { MessageResponse } from '../background/types';

export class ContentManager {
  private state: ContentState;
  private events: ContentEvents;
  private observer: MutationObserver | null = null;

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

    console.log('[Sift] Platform:', { platform: this.state.platform, isApp: this.state.isApplicationPage, title: platformInfo.jobTitle, company: platformInfo.company });

    await this.sendMessage({ type: 'CONTENT_READY', payload: { url: window.location.href, platform: this.state.platform, isApplicationPage: this.state.isApplicationPage } });

    this.setupPageMonitoring();
    if (this.state.isApplicationPage) await this.checkForForm();

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
    if (this.state.isApplicationPage) setTimeout(() => this.checkForForm(), 500);
    else this.state.currentForm = null;
  }

  private async checkForForm(): Promise<void> {
    console.log('[Sift] Checking for form...');
    let attempts = 0;
    while (attempts < 5) {
      if (hasApplicationForm(this.state.platform)) {
        console.log('[Sift] Form found');
        await this.detectFormFields();
        return;
      }
      attempts++;
      await new Promise((r) => setTimeout(r, 500));
    }
    console.log('[Sift] No form found');
  }

  private async detectFormFields(): Promise<void> {
    const form = this.findApplicationForm();
    if (!form) return;
    const fields = this.getBasicFieldInfo(form);
    await this.sendMessage({ type: 'FORM_DETECTED', payload: { url: window.location.href, platform: this.state.platform, fieldCount: fields.length, fields } });
    this.events.onFormDetected?.({ id: 'form-' + Date.now(), platform: this.state.platform, url: window.location.href, fields: [], isMultiPage: false });
  }

  private findApplicationForm(): HTMLFormElement | null {
    const selectors = ['form[data-controller="application"]', 'form.application-form', '#application-form', '#application', 'form[action*="apply"]', 'main form', 'form'];
    for (const s of selectors) {
      const form = document.querySelector<HTMLFormElement>(s);
      if (form && this.isLikelyApplicationForm(form)) return form;
    }
    return null;
  }

  private isLikelyApplicationForm(form: HTMLFormElement): boolean {
    const inputs = form.querySelectorAll('input, textarea, select');
    if (inputs.length < 3) return false;
    const html = form.innerHTML.toLowerCase();
    return ['name', 'email', 'phone', 'resume', 'cover', 'linkedin'].filter((i) => html.includes(i)).length >= 2;
  }

  private getBasicFieldInfo(form: HTMLFormElement): Array<{ name: string; type: string; label?: string; required: boolean }> {
    const fields: Array<{ name: string; type: string; label?: string; required: boolean }> = [];
    form.querySelectorAll('input, textarea, select').forEach((input) => {
      const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (el instanceof HTMLInputElement && ['hidden', 'submit', 'button'].includes(el.type)) return;
      let label: string | undefined;
      const labelEl = form.querySelector(`label[for="${el.id}"]`);
      if (labelEl) label = labelEl.textContent?.trim();
      else { const p = el.closest('label'); if (p) label = p.textContent?.replace(el.value || '', '').trim(); }
      fields.push({ name: el.name || el.id || '', type: el instanceof HTMLSelectElement ? 'select' : el instanceof HTMLTextAreaElement ? 'textarea' : (el as HTMLInputElement).type || 'text', label, required: el.required || el.hasAttribute('aria-required') });
    });
    return fields;
  }

  private async sendMessage(message: { type: string; payload?: unknown }): Promise<MessageResponse> {
    try { return await chrome.runtime.sendMessage(message) as MessageResponse; }
    catch (e) { console.error('[Sift] Message failed:', e); return { success: false, error: 'Failed' }; }
  }

  getState(): ContentState { return { ...this.state }; }
  getPlatform(): ATSPlatform { return this.state.platform; }
  isOnApplicationPage(): boolean { return this.state.isApplicationPage; }
  destroy(): void { this.observer?.disconnect(); this.observer = null; this.state.initialized = false; }
}

export default ContentManager;
