/**
 * Groq Client - Ultra-fast inference
 * Uses OpenAI-compatible API format
 */

import { BaseLLMClient } from './BaseLLMClient';
import type { LLMProvider, LLMConfig, GenerateOptions, GenerateResponse } from './types';
import { PROVIDER_INFO } from './types';

export class GroqClient extends BaseLLMClient {
  readonly provider: LLMProvider = 'groq';

  constructor(config: Partial<LLMConfig> = {}) {
    super({
      endpoint: PROVIDER_INFO.groq.defaultEndpoint,
      model: PROVIDER_INFO.groq.defaultModel,
      ...config,
    });
  }

  async checkHealth(): Promise<boolean> {
    if (!this.config.apiKey) return false;
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/models`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    if (!this.config.apiKey) return [];
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/models`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
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

    if (!this.config.apiKey) {
      throw new Error('API key required for Groq');
    }

    try {
      const messages = [];
      
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
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

export default GroqClient;
