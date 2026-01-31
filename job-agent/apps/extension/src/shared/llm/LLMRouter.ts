/**
 * LLM Router - Unified interface for all LLM providers
 * Handles provider switching, fallbacks, and settings integration
 */

import type { 
  LLMClient, 
  LLMProvider, 
  LLMConfig, 
  GenerateOptions, 
  GenerateResponse,
  ProviderInfo
} from './types';
import { PROVIDER_INFO, getDefaultConfig } from './types';
import { OllamaClient } from './OllamaClient';
import { OpenAIClient } from './OpenAIClient';
import { AnthropicClient } from './AnthropicClient';
import { GeminiClient } from './GeminiClient';
import { OpenRouterClient } from './OpenRouterClient';
import { GroqClient } from './GroqClient';

export interface LLMRouterConfig {
  primary: LLMConfig;
  fallback?: LLMConfig;
  enableFallback?: boolean;
}

export interface ConnectionStatus {
  provider: LLMProvider;
  connected: boolean;
  model: string;
  latencyMs?: number;
  error?: string;
}

/**
 * LLM Router - Main entry point for LLM functionality
 */
export class LLMRouter {
  private primaryClient: LLMClient;
  private fallbackClient?: LLMClient;
  private config: LLMRouterConfig;

  constructor(config: LLMRouterConfig) {
    this.config = config;
    this.primaryClient = this.createClient(config.primary);
    
    if (config.fallback && config.enableFallback) {
      this.fallbackClient = this.createClient(config.fallback);
    }
  }

  /**
   * Create appropriate client for provider
   */
  private createClient(config: LLMConfig): LLMClient {
    switch (config.provider) {
      case 'ollama':
        return new OllamaClient(config);
      case 'openai':
        return new OpenAIClient(config);
      case 'anthropic':
        return new AnthropicClient(config);
      case 'gemini':
        return new GeminiClient(config);
      case 'openrouter':
        return new OpenRouterClient(config);
      case 'groq':
        return new GroqClient(config);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  /**
   * Get current provider
   */
  get provider(): LLMProvider {
    return this.config.primary.provider;
  }

  /**
   * Get current model
   */
  get model(): string {
    return this.config.primary.model;
  }

  /**
   * Check connection to primary provider
   */
  async checkConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now();
    
    try {
      const connected = await this.primaryClient.checkHealth();
      return {
        provider: this.config.primary.provider,
        connected,
        model: this.config.primary.model,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        provider: this.config.primary.provider,
        connected: false,
        model: this.config.primary.model,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check all configured providers
   */
  async checkAllConnections(): Promise<ConnectionStatus[]> {
    const results: ConnectionStatus[] = [];
    
    results.push(await this.checkConnection());
    
    if (this.fallbackClient) {
      const startTime = Date.now();
      try {
        const connected = await this.fallbackClient.checkHealth();
        results.push({
          provider: this.config.fallback!.provider,
          connected,
          model: this.config.fallback!.model,
          latencyMs: Date.now() - startTime,
        });
      } catch (error) {
        results.push({
          provider: this.config.fallback!.provider,
          connected: false,
          model: this.config.fallback!.model,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  /**
   * Generate text with automatic fallback
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResponse> {
    try {
      return await this.primaryClient.generate(prompt, options);
    } catch (primaryError) {
      // Try fallback if enabled
      if (this.fallbackClient && this.config.enableFallback) {
        console.warn(
          `Primary LLM (${this.config.primary.provider}) failed, trying fallback...`
        );
        try {
          return await this.fallbackClient.generate(prompt, options);
        } catch (fallbackError) {
          // Both failed, throw primary error
          throw primaryError;
        }
      }
      throw primaryError;
    }
  }

  /**
   * List available models for primary provider
   */
  async listModels(): Promise<string[]> {
    if ('listModels' in this.primaryClient && typeof this.primaryClient.listModels === 'function') {
      return this.primaryClient.listModels();
    }
    return [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LLMRouterConfig>): void {
    if (config.primary) {
      this.config.primary = { ...this.config.primary, ...config.primary };
      this.primaryClient = this.createClient(this.config.primary);
    }
    
    if (config.fallback !== undefined) {
      this.config.fallback = config.fallback;
      this.fallbackClient = config.fallback 
        ? this.createClient(config.fallback)
        : undefined;
    }
    
    if (config.enableFallback !== undefined) {
      this.config.enableFallback = config.enableFallback;
    }
  }

  /**
   * Switch to a different provider
   */
  switchProvider(provider: LLMProvider, apiKey?: string): void {
    const defaultConfig = getDefaultConfig(provider);
    this.config.primary = {
      ...defaultConfig,
      apiKey,
    };
    this.primaryClient = this.createClient(this.config.primary);
  }

  // ============================================
  // Convenience Methods for Form Filling
  // ============================================

  /**
   * Match a form field to a profile field
   */
  async matchFieldToProfile(
    fieldLabel: string,
    fieldType: string,
    profileKeys: string[]
  ): Promise<string | null> {
    const prompt = `Given this form field:
Label: "${fieldLabel}"
Type: ${fieldType}

Match it to ONE of these profile fields. Respond with ONLY the field name, or "null" if no match:
${profileKeys.join(', ')}`;

    const response = await this.generate(prompt, {
      maxTokens: 50,
      temperature: 0.1,
    });

    const match = response.text.trim().toLowerCase();
    return match === 'null' || match === '' ? null : match;
  }

  /**
   * Generate a response for a form question
   */
  async generateFormResponse(
    question: string,
    profileContext: string,
    previousResponses?: string[]
  ): Promise<string> {
    const systemPrompt = `You are helping fill out a job application. Generate a professional, concise response based on the candidate's profile. Keep responses focused and relevant. Do not make up information not provided in the profile.`;

    let prompt = `Profile Information:
${profileContext}

`;

    if (previousResponses && previousResponses.length > 0) {
      prompt += `Similar past responses for reference:
${previousResponses.join('\n---\n')}

`;
    }

    prompt += `Question: ${question}

Generate an appropriate response (2-4 sentences unless more is needed):`;

    const response = await this.generate(prompt, {
      systemPrompt,
      maxTokens: 500,
      temperature: 0.7,
    });

    return response.text.trim();
  }

  /**
   * Summarize a job description
   */
  async summarizeJobDescription(jobDescription: string): Promise<string> {
    const prompt = `Summarize this job description in 2-3 sentences, highlighting:
- The role and responsibilities
- Key requirements
- Any standout benefits or characteristics

Job Description:
${jobDescription.substring(0, 3000)}

Summary:`;

    const response = await this.generate(prompt, {
      maxTokens: 200,
      temperature: 0.5,
    });

    return response.text.trim();
  }

  /**
   * Extract tech stack from job description
   */
  async extractTechStack(jobDescription: string): Promise<string[]> {
    const prompt = `Extract all technologies, programming languages, frameworks, and tools mentioned in this job description. Return as a comma-separated list.

Job Description:
${jobDescription.substring(0, 2000)}

Technologies (comma-separated):`;

    const response = await this.generate(prompt, {
      maxTokens: 200,
      temperature: 0.1,
    });

    return response.text
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0 && t.length < 50);
  }

  /**
   * Calculate relevance score between profile and job
   */
  async calculateRelevanceScore(
    profileSkills: string[],
    jobDescription: string
  ): Promise<number> {
    const prompt = `Rate how well this candidate's skills match the job on a scale of 0-100.

Candidate Skills: ${profileSkills.join(', ')}

Job Description:
${jobDescription.substring(0, 1500)}

Respond with ONLY a number between 0 and 100:`;

    const response = await this.generate(prompt, {
      maxTokens: 10,
      temperature: 0.1,
    });

    const score = parseInt(response.text.trim(), 10);
    return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
  }

  // ============================================
  // Static Helpers
  // ============================================

  /**
   * Get all available providers
   */
  static getProviders(): ProviderInfo[] {
    return Object.values(PROVIDER_INFO);
  }

  /**
   * Get provider info
   */
  static getProviderInfo(provider: LLMProvider): ProviderInfo {
    return PROVIDER_INFO[provider];
  }

  /**
   * Get free tier providers
   */
  static getFreeTierProviders(): ProviderInfo[] {
    return Object.values(PROVIDER_INFO).filter(p => p.freetier);
  }

  /**
   * Create router from settings
   */
  static fromSettings(settings: {
    provider: LLMProvider;
    endpoint?: string;
    model?: string;
    apiKey?: string;
    maxTokens?: number;
    temperature?: number;
  }): LLMRouter {
    const providerInfo = PROVIDER_INFO[settings.provider];
    
    return new LLMRouter({
      primary: {
        provider: settings.provider,
        endpoint: settings.endpoint || providerInfo.defaultEndpoint,
        model: settings.model || providerInfo.defaultModel,
        apiKey: settings.apiKey,
        maxTokens: settings.maxTokens || 1024,
        temperature: settings.temperature || 0.7,
        timeout: 30000,
      },
    });
  }
}

export default LLMRouter;
