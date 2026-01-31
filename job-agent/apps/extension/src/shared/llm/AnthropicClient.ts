/**
 * Anthropic Client - Claude models
 */

import { BaseLLMClient } from './BaseLLMClient';
import type { LLMProvider, LLMConfig, GenerateOptions, GenerateResponse } from './types';
import { PROVIDER_INFO } from './types';

export class AnthropicClient extends BaseLLMClient {
  readonly provider: LLMProvider = 'anthropic';

  constructor(config: Partial<LLMConfig> = {}) {
    super({
      endpoint: PROVIDER_INFO.anthropic.defaultEndpoint,
      model: PROVIDER_INFO.anthropic.defaultModel,
      ...config,
    });
  }

  async checkHealth(): Promise<boolean> {
    // Anthropic doesn't have a simple health endpoint
    // Just check if API key is set
    return !!this.config.apiKey;
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResponse> {
    const startTime = Date.now();

    if (!this.config.apiKey) {
      throw new Error('API key required for Anthropic');
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/v1/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: this.config.model,
            max_tokens: options.maxTokens ?? this.config.maxTokens,
            system: options.systemPrompt,
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: options.temperature ?? this.config.temperature,
            stop_sequences: options.stopSequences,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        text: data.content?.[0]?.text || '',
        model: data.model || this.config.model,
        provider: this.provider,
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined,
        finishReason: data.stop_reason,
        latencyMs: this.measureLatency(startTime),
      };
    } catch (error) {
      this.createErrorResponse(error, startTime);
    }
  }
}

export default AnthropicClient;
