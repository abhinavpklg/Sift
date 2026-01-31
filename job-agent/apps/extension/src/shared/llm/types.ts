/**
 * LLM Types - Unified interface for all LLM providers
 */

export type LLMProvider = 
  | 'ollama'      // Local
  | 'openai'      // OpenAI
  | 'anthropic'   // Anthropic/Claude
  | 'gemini'      // Google Gemini
  | 'openrouter'  // OpenRouter (free tier available)
  | 'groq';       // Groq (fast & free tier)

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  endpoint?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface GenerateResponse {
  text: string;
  model: string;
  provider: LLMProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  latencyMs: number;
}

export interface LLMClient {
  readonly provider: LLMProvider;
  
  checkHealth(): Promise<boolean>;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResponse>;
  listModels?(): Promise<string[]>;
}

export interface ProviderInfo {
  id: LLMProvider;
  name: string;
  description: string;
  requiresApiKey: boolean;
  defaultEndpoint: string;
  defaultModel: string;
  freetier: boolean;
  models: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  description?: string;
}

/**
 * Provider configurations and defaults
 */
export const PROVIDER_INFO: Record<LLMProvider, ProviderInfo> = {
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run LLMs locally on your machine',
    requiresApiKey: false,
    defaultEndpoint: 'http://localhost:11434',
    defaultModel: 'llama3.2:8b-instruct-q4_K_M',
    freetier: true,
    models: [
      { id: 'llama3.2:8b-instruct-q4_K_M', name: 'Llama 3.2 8B', contextWindow: 8192 },
      { id: 'llama3.2:3b-instruct-q4_K_M', name: 'Llama 3.2 3B', contextWindow: 8192 },
      { id: 'mistral:7b-instruct', name: 'Mistral 7B', contextWindow: 8192 },
      { id: 'qwen2.5:7b-instruct', name: 'Qwen 2.5 7B', contextWindow: 32768 },
    ],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 models',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    freetier: false,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385 },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    freetier: false,
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextWindow: 200000 },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000 },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextWindow: 200000 },
    ],
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google AI models',
    requiresApiKey: true,
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-flash',
    freetier: true,
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 1000000 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1000000 },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', contextWindow: 1000000 },
    ],
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access many models with one API (free tier available)',
    requiresApiKey: true,
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.2-3b-instruct:free',
    freetier: true,
    models: [
      { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)', contextWindow: 8192 },
      { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Free)', contextWindow: 8192 },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', contextWindow: 8192 },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', contextWindow: 200000 },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
    ],
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference (free tier available)',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    freetier: true,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', contextWindow: 128000 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', contextWindow: 128000 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextWindow: 32768 },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', contextWindow: 8192 },
    ],
  },
};

/**
 * Get default config for a provider
 */
export function getDefaultConfig(provider: LLMProvider): LLMConfig {
  const info = PROVIDER_INFO[provider];
  return {
    provider,
    endpoint: info.defaultEndpoint,
    model: info.defaultModel,
    maxTokens: 1024,
    temperature: 0.7,
    timeout: 30000,
  };
}
