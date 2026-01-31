/**
 * Base LLM Client - Common functionality for all providers
 */

import type { LLMClient, LLMProvider, LLMConfig, GenerateOptions, GenerateResponse } from './types';

export abstract class BaseLLMClient implements LLMClient {
  abstract readonly provider: LLMProvider;
  
  protected config: LLMConfig;

  constructor(config: Partial<LLMConfig>) {
    this.config = {
      provider: 'ollama', // Will be overridden by subclass
      maxTokens: config.maxTokens ?? 1024,
      temperature: config.temperature ?? 0.7,
      timeout: config.timeout ?? 30000,
      model: config.model ?? '',
      endpoint: config.endpoint ?? '',
      apiKey: config.apiKey,
      ...config,
    } as LLMConfig;
  }

  abstract checkHealth(): Promise<boolean>;
  abstract generate(prompt: string, options?: GenerateOptions): Promise<GenerateResponse>;

  /**
   * Helper for fetch with timeout
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Create standard error response
   */
  protected createErrorResponse(error: unknown, _startTime: number): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`[${this.provider}] ${message}`);
  }

  /**
   * Measure latency
   */
  protected measureLatency(startTime: number): number {
    return Date.now() - startTime;
  }
}
