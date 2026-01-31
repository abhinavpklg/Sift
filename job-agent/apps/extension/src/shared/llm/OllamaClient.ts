/**
 * Ollama Client - Local LLM via Ollama
 */

import { BaseLLMClient } from './BaseLLMClient';
import type { LLMProvider, LLMConfig, GenerateOptions, GenerateResponse } from './types';
import { PROVIDER_INFO } from './types';

export class OllamaClient extends BaseLLMClient {
  readonly provider: LLMProvider = 'ollama';

  constructor(config: Partial<LLMConfig> = {}) {
    super({
      endpoint: PROVIDER_INFO.ollama.defaultEndpoint,
      model: PROVIDER_INFO.ollama.defaultModel,
      ...config,
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/api/tags`,
        { method: 'GET' }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/api/tags`,
        { method: 'GET' }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((m: { name: string }) => m.name) || [];
    } catch {
      return [];
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResponse> {
    const startTime = Date.now();

    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.config.model,
            prompt: options.systemPrompt 
              ? `${options.systemPrompt}\n\n${prompt}` 
              : prompt,
            stream: false,
            options: {
              num_predict: options.maxTokens ?? this.config.maxTokens,
              temperature: options.temperature ?? this.config.temperature,
              stop: options.stopSequences,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        text: data.response,
        model: this.config.model,
        provider: this.provider,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        finishReason: data.done ? 'stop' : 'length',
        latencyMs: this.measureLatency(startTime),
      };
    } catch (error) {
      this.createErrorResponse(error, startTime);
    }
  }
}

export default OllamaClient;
