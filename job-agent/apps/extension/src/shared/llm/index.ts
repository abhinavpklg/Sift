/**
 * LLM Module Exports
 */

// Types
export type {
  LLMProvider,
  LLMConfig,
  GenerateOptions,
  GenerateResponse,
  LLMClient,
  ProviderInfo,
  ModelInfo,
} from './types';
export { PROVIDER_INFO, getDefaultConfig } from './types';

// Clients
export { OllamaClient } from './OllamaClient';
export { OpenAIClient } from './OpenAIClient';
export { AnthropicClient } from './AnthropicClient';
export { GeminiClient } from './GeminiClient';
export { OpenRouterClient } from './OpenRouterClient';
export { GroqClient } from './GroqClient';

// Router
export { LLMRouter } from './LLMRouter';
export type { LLMRouterConfig, ConnectionStatus } from './LLMRouter';

// Prompts
export { PROMPTS, FIELD_PATTERNS, matchFieldPattern } from './prompts';
