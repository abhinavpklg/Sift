/**
 * Gemini Client - Google AI models
 */

import { BaseLLMClient } from './BaseLLMClient';
import type { LLMProvider, LLMConfig, GenerateOptions, GenerateResponse } from './types';
import { PROVIDER_INFO } from './types';

export class GeminiClient extends BaseLLMClient {
  readonly provider: LLMProvider = 'gemini';

  constructor(config: Partial<LLMConfig> = {}) {
    super({
      endpoint: PROVIDER_INFO.gemini.defaultEndpoint,
      model: PROVIDER_INFO.gemini.defaultModel,
      ...config,
    });
  }

  async checkHealth(): Promise<boolean> {
    if (!this.config.apiKey) return false;
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/models?key=${this.config.apiKey}`,
        { method: 'GET' }
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
        `${this.config.endpoint}/models?key=${this.config.apiKey}`,
        { method: 'GET' }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((m: { name: string }) => m.name.replace('models/', '')) || [];
    } catch {
      return [];
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResponse> {
    const startTime = Date.now();

    if (!this.config.apiKey) {
      throw new Error('API key required for Gemini');
    }

    try {
      const contents = [];
      
      if (options.systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `System: ${options.systemPrompt}\n\nUser: ${prompt}` }]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }

      const response = await this.fetchWithTimeout(
        `${this.config.endpoint}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: options.maxTokens ?? this.config.maxTokens,
              temperature: options.temperature ?? this.config.temperature,
              stopSequences: options.stopSequences,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';

      return {
        text,
        model: this.config.model,
        provider: this.provider,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0,
        } : undefined,
        finishReason: candidate?.finishReason,
        latencyMs: this.measureLatency(startTime),
      };
    } catch (error) {
      this.createErrorResponse(error, startTime);
    }
  }
}

export default GeminiClient;
