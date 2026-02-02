/**
 * Message Handler - Routes messages to appropriate handlers
 */

import type { ExtensionMessage, MessageResponse } from './types';
import type { BadgeManager } from './BadgeManager';
import { ProfileStorage } from '../shared/storage/ProfileStorage';
import { SettingsStorage } from '../shared/storage/SettingsStorage';
import { JobStorage } from '../shared/storage/JobStorage';
import { ResponseStorage } from '../shared/storage/ResponseStorage';
import { LLMRouter, type LLMProvider, type ConnectionStatus } from '../shared/llm';

export class MessageHandler {
  private llmRouter: LLMRouter | null = null;
  private badgeManager: BadgeManager;

  constructor(badgeManager: BadgeManager) {
    this.badgeManager = badgeManager;
    this.initializeLLM();
  }

  private async initializeLLM(): Promise<void> {
    try {
      const settings = await SettingsStorage.getAll();
      const llmConfig = settings.llm;
      this.llmRouter = LLMRouter.fromSettings({
        provider: llmConfig.provider as LLMProvider,
        endpoint: llmConfig.endpoint,
        apiKey: llmConfig.apiKey,
        model: llmConfig.model,
      });
      console.log('[Sift] LLM Router initialized with provider:', llmConfig.provider);
    } catch (error) {
      console.error('[Sift] Failed to initialize LLM:', error);
    }
  }

  async handle(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    const { type } = message;
    const payload = message.payload;

    try {
      switch (type) {
        // Profile handlers
        case 'GET_PROFILES':
          return this.handleGetProfiles();
        case 'GET_ACTIVE_PROFILE':
          return this.handleGetActiveProfile();
        case 'SET_ACTIVE_PROFILE':
          return this.handleSetActiveProfile(payload as { profileId: string });
        case 'CREATE_PROFILE':
          return this.handleCreateProfile(payload as { profile: Parameters<typeof ProfileStorage.create>[0] });
        case 'UPDATE_PROFILE':
          return this.handleUpdateProfile(payload as { profileId: string; updates: Parameters<typeof ProfileStorage.update>[1] });
        case 'DELETE_PROFILE':
          return this.handleDeleteProfile(payload as { profileId: string });

        // Settings handlers
        case 'GET_SETTINGS':
          return this.handleGetSettings();
        case 'UPDATE_SETTINGS':
          return this.handleUpdateSettings(payload as { updates: Parameters<typeof SettingsStorage.update>[0] });
        case 'GET_LLM_CONFIG':
          return this.handleGetLLMConfig();
        case 'SET_LLM_PROVIDER':
          return this.handleSetLLMProvider(payload as { provider: LLMProvider; endpoint?: string; apiKey?: string; model?: string });

        // Job handlers
        case 'GET_JOBS':
          return this.handleGetJobs();
        case 'ADD_JOB':
          return this.handleAddJob(payload as Parameters<typeof JobStorage.addScrapedJob>[0]);
        case 'MARK_JOB_APPLIED':
          return this.handleMarkJobApplied(payload as Parameters<typeof JobStorage.markAsApplied>[0]);
        case 'IS_URL_APPLIED':
          return this.handleIsUrlApplied(payload as { url: string });
        case 'GET_JOB_STATS':
          return this.handleGetJobStats();

        // Response handlers
        case 'SAVE_RESPONSE':
          return this.handleSaveResponse(payload as { question: string; answer: string; category?: string });
        case 'FIND_SIMILAR_RESPONSES':
          return this.handleFindSimilarResponses(payload as { question: string; threshold?: number });
        case 'GET_BEST_RESPONSE':
          return this.handleGetBestResponse(payload as { question: string });

        // LLM handlers
        case 'LLM_GENERATE':
          return this.handleLLMGenerate(payload as { prompt: string; systemPrompt?: string; maxTokens?: number; temperature?: number });
        case 'LLM_CHECK_CONNECTION':
          return this.handleLLMCheckConnection();
        case 'LLM_GENERATE_FORM_RESPONSE':
          return this.handleLLMGenerateFormResponse(payload as { question: string; profileContext: string; fieldType?: string });
        case 'LLM_MATCH_FIELD':
          return this.handleLLMMatchField(payload as { fieldLabel: string; fieldType: string; profileKeys: string[] });
        case 'LLM_SUMMARIZE_JOB':
          return this.handleLLMSummarizeJob(payload as { description: string });

        // Badge handlers
        case 'UPDATE_BADGE':
          return this.handleUpdateBadge();
        case 'GET_TODAY_COUNT':
          return this.handleGetTodayCount();

        // Content script handlers
        case 'CONTENT_READY':
          return this.handleContentReady(sender);
        case 'FORM_DETECTED':
          return this.handleFormDetected(payload as { url: string; platform: string; fieldCount: number }, sender);

        default:
          console.warn('[Sift] Unknown message type:', type);
          return { success: false, error: `Unknown message type: ${type}` };
      }
    } catch (error) {
      console.error(`[Sift] Error handling ${type}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================
  // Profile Handlers
  // ============================================

  private async handleGetProfiles(): Promise<MessageResponse> {
    return { success: true, data: await ProfileStorage.getAll() };
  }

  private async handleGetActiveProfile(): Promise<MessageResponse> {
    return { success: true, data: await ProfileStorage.getActive() };
  }

  private async handleSetActiveProfile(payload: { profileId: string }): Promise<MessageResponse> {
    await ProfileStorage.setActive(payload.profileId);
    return { success: true, data: await ProfileStorage.getActive() };
  }

  private async handleCreateProfile(payload: { profile: Parameters<typeof ProfileStorage.create>[0] }): Promise<MessageResponse> {
    return { success: true, data: await ProfileStorage.create(payload.profile) };
  }

  private async handleUpdateProfile(payload: { profileId: string; updates: Parameters<typeof ProfileStorage.update>[1] }): Promise<MessageResponse> {
    return { success: true, data: await ProfileStorage.update(payload.profileId, payload.updates) };
  }

  private async handleDeleteProfile(payload: { profileId: string }): Promise<MessageResponse> {
    await ProfileStorage.delete(payload.profileId);
    return { success: true };
  }

  // ============================================
  // Settings Handlers
  // ============================================

  private async handleGetSettings(): Promise<MessageResponse> {
    return { success: true, data: await SettingsStorage.getAll() };
  }

  private async handleUpdateSettings(payload: { updates: Parameters<typeof SettingsStorage.update>[0] }): Promise<MessageResponse> {
    return { success: true, data: await SettingsStorage.update(payload.updates) };
  }

  private async handleGetLLMConfig(): Promise<MessageResponse> {
    const settings = await SettingsStorage.getAll();
    return { success: true, data: settings.llm };
  }

  private async handleSetLLMProvider(payload: { provider: LLMProvider; endpoint?: string; apiKey?: string; model?: string }): Promise<MessageResponse> {
    // Update settings - cast provider to string since settings type is narrower than LLMProvider
    const settings = await SettingsStorage.getAll();
    await SettingsStorage.update({
      llm: {
        ...settings.llm,
        provider: payload.provider as LLMProvider,
        endpoint: payload.endpoint || settings.llm.endpoint,
        apiKey: payload.apiKey,
        model: payload.model || settings.llm.model,
      },
    });
    // Reinitialize LLM router
    await this.initializeLLM();
    return { success: true };
  }

  // ============================================
  // Job Handlers
  // ============================================

  private async handleGetJobs(): Promise<MessageResponse> {
    const jobs = await JobStorage.getAppliedJobs();
    return { success: true, data: jobs };
  }

  private async handleAddJob(payload: Parameters<typeof JobStorage.addScrapedJob>[0]): Promise<MessageResponse> {
    return { success: true, data: await JobStorage.addScrapedJob(payload) };
  }

  private async handleMarkJobApplied(payload: Parameters<typeof JobStorage.markAsApplied>[0]): Promise<MessageResponse> {
    const job = await JobStorage.markAsApplied(payload);
    await this.badgeManager.refreshCount();
    return { success: true, data: job };
  }

  private async handleIsUrlApplied(payload: { url: string }): Promise<MessageResponse> {
    return { success: true, data: await JobStorage.isUrlApplied(payload.url) };
  }

  private async handleGetJobStats(): Promise<MessageResponse> {
    return { success: true, data: await JobStorage.getStats() };
  }

  // ============================================
  // Response Handlers
  // ============================================

  private async handleSaveResponse(payload: { question: string; answer: string; category?: string }): Promise<MessageResponse> {
    const response = await ResponseStorage.save(
      payload.question,
      payload.answer,
      payload.category as Parameters<typeof ResponseStorage.save>[2]
    );
    return { success: true, data: response };
  }

  private async handleFindSimilarResponses(payload: { question: string; threshold?: number }): Promise<MessageResponse> {
    // findSimilar takes (question, options?) where options is { minScore?, maxResults?, profileId?, category? }
    const options = payload.threshold !== undefined ? { minScore: payload.threshold } : undefined;
    return { success: true, data: await ResponseStorage.findSimilar(payload.question, options) };
  }

  private async handleGetBestResponse(payload: { question: string }): Promise<MessageResponse> {
    return { success: true, data: await ResponseStorage.findBestMatch(payload.question) };
  }

  // ============================================
  // LLM Handlers
  // ============================================

  private async handleLLMGenerate(payload: { prompt: string; systemPrompt?: string; maxTokens?: number; temperature?: number }): Promise<MessageResponse> {
    if (!this.llmRouter) return { success: false, error: 'LLM not initialized' };
    return { success: true, data: await this.llmRouter.generate(payload.prompt, payload) };
  }

  private async handleLLMCheckConnection(): Promise<MessageResponse<ConnectionStatus>> {
    if (!this.llmRouter) {
      return {
        success: true,
        data: { provider: 'ollama', connected: false, model: 'unknown', error: 'LLM not initialized' },
      };
    }
    return { success: true, data: await this.llmRouter.checkConnection() };
  }

  private async handleLLMGenerateFormResponse(payload: { question: string; profileContext: string; fieldType?: string }): Promise<MessageResponse> {
    if (!this.llmRouter) return { success: false, error: 'LLM not initialized' };
    const options = payload.fieldType ? [payload.fieldType] : undefined;
    return { success: true, data: await this.llmRouter.generateFormResponse(payload.question, payload.profileContext, options) };
  }

  private async handleLLMMatchField(payload: { fieldLabel: string; fieldType: string; profileKeys: string[] }): Promise<MessageResponse> {
    if (!this.llmRouter) return { success: false, error: 'LLM not initialized' };
    return { success: true, data: await this.llmRouter.matchFieldToProfile(payload.fieldLabel, payload.fieldType, payload.profileKeys) };
  }

  private async handleLLMSummarizeJob(payload: { description: string }): Promise<MessageResponse> {
    if (!this.llmRouter) return { success: false, error: 'LLM not initialized' };
    return { success: true, data: await this.llmRouter.summarizeJobDescription(payload.description) };
  }

  // ============================================
  // Badge Handlers
  // ============================================

  private async handleUpdateBadge(): Promise<MessageResponse> {
    await this.badgeManager.refreshCount();
    return { success: true, data: { count: await this.badgeManager.getCount() } };
  }

  private async handleGetTodayCount(): Promise<MessageResponse> {
    return { success: true, data: { count: await this.badgeManager.getCount() } };
  }

  // ============================================
  // Content Script Handlers
  // ============================================

  private async handleContentReady(sender: chrome.runtime.MessageSender): Promise<MessageResponse> {
    console.log('[Sift] Content script ready on tab:', sender.tab?.id, sender.tab?.url);
    return { success: true };
  }

  private async handleFormDetected(
    payload: { url: string; platform: string; fieldCount: number },
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    console.log('[Sift] Form detected:', { tab: sender.tab?.id, platform: payload.platform, fields: payload.fieldCount });
    return { success: true };
  }
}

export default MessageHandler;
