/**
 * OpenRouter Client - Access many models with one API
 * Uses OpenAI-compatible API format
 */

import { BaseLLMClient } from './BaseLLMClient';
import type { LLMProvider, LLMConfig, GenerateOptions, GenerateResponse } from './types';
import { PROVIDER_INFO } from './types';

export class OpenRouterClient extends BaseLLMClient {
  readonly provider: LLMProvider = 'openrouter';

  constructor(config: Partial<LLMConfig> = {}) {
    super({
      endpoint: PROVIDER_INFO.openrouter.defaultEndpoint,
      model: PROVIDER_INFO.openrouter.defaultModel,
      ...config,
    });
  }

  async checkHealth(): Promise<boolean> {
    // OpenRouter allows some free models without API key
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/models`,
        {
          method: 'GET',
          headers: this.config.apiKey ? {
            'Authorization': `Bearer ${this.config.apiKey}`,
          } : {},
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/models`,
        {
          method: 'GET',
          headers: this.config.apiKey ? {
            'Authorization': `Bearer ${this.config.apiKey}`,
          } : {},
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.data?.map((m: { id: string }) => m.id) || [];
    } catch {
      return [];
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResponse> {
    const startTime = Date.now();

    try {
      const messages = [];
      
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sift-extension.local',
        'X-Title': 'Sift Job Application Assistant',
      };
      
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/chat/completions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.config.model,
            messages,
            max_tokens: options.maxTokens ?? this.config.maxTokens,
            temperature: options.temperature ?? this.config.temperature,
            stop: options.stopSequences,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      return {
        text: choice?.message?.content || '',
        model: data.model || this.config.model,
        provider: this.provider,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        finishReason: choice?.finish_reason,
        latencyMs: this.measureLatency(startTime),
      };
    } catch (error) {
      this.createErrorResponse(error, startTime);
    }
  }
}

export default OpenRouterClient;
