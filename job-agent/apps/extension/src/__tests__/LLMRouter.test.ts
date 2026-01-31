/**
 * LLM Layer Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  LLMRouter, 
  PROVIDER_INFO, 
  getDefaultConfig,
  matchFieldPattern 
} from '../shared/llm';

// Mock fetch
global.fetch = vi.fn();

describe('LLM Types', () => {
  describe('PROVIDER_INFO', () => {
    it('should have all providers defined', () => {
      const providers = ['ollama', 'openai', 'anthropic', 'gemini', 'openrouter', 'groq'];
      providers.forEach(p => {
        expect(PROVIDER_INFO[p as keyof typeof PROVIDER_INFO]).toBeDefined();
      });
    });

    it('should have required fields for each provider', () => {
      Object.values(PROVIDER_INFO).forEach(info => {
        expect(info.id).toBeDefined();
        expect(info.name).toBeDefined();
        expect(info.defaultEndpoint).toBeDefined();
        expect(info.defaultModel).toBeDefined();
        expect(info.models.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDefaultConfig', () => {
    it('should return valid config for each provider', () => {
      const providers = ['ollama', 'openai', 'anthropic', 'gemini', 'openrouter', 'groq'] as const;
      
      providers.forEach(p => {
        const config = getDefaultConfig(p);
        expect(config.provider).toBe(p);
        expect(config.endpoint).toBeDefined();
        expect(config.model).toBeDefined();
        expect(config.maxTokens).toBeGreaterThan(0);
      });
    });
  });
});

describe('LLMRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create router with primary config', () => {
      const router = new LLMRouter({
        primary: getDefaultConfig('ollama'),
      });

      expect(router.provider).toBe('ollama');
    });

    it('should create router with fallback', () => {
      const router = new LLMRouter({
        primary: getDefaultConfig('ollama'),
        fallback: getDefaultConfig('openrouter'),
        enableFallback: true,
      });

      expect(router.provider).toBe('ollama');
    });
  });

  describe('checkConnection', () => {
    it('should return connected status for healthy provider', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ models: [] }),
      });

      const router = new LLMRouter({
        primary: getDefaultConfig('ollama'),
      });

      const status = await router.checkConnection();

      expect(status.provider).toBe('ollama');
      expect(status.connected).toBe(true);
    });

    it('should return disconnected for failed health check', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const router = new LLMRouter({
        primary: getDefaultConfig('ollama'),
      });

      const status = await router.checkConnection();

      // checkHealth catches errors and returns false gracefully
      // so connected is false but error may not be set
      expect(status.connected).toBe(false);
    });
  });

  describe('generate', () => {
    it('should generate text from primary provider', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          response: 'Test response',
          eval_count: 10,
        }),
      });

      const router = new LLMRouter({
        primary: getDefaultConfig('ollama'),
      });

      const result = await router.generate('Test prompt');

      expect(result.text).toBe('Test response');
      expect(result.provider).toBe('ollama');
    });

    it('should fallback on primary failure', async () => {
      // Primary fails
      (global.fetch as any).mockRejectedValueOnce(new Error('Primary failed'));
      // Fallback succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Fallback response' } }],
        }),
      });

      const router = new LLMRouter({
        primary: getDefaultConfig('ollama'),
        fallback: {
          ...getDefaultConfig('openrouter'),
          apiKey: 'test-key',
        },
        enableFallback: true,
      });

      const result = await router.generate('Test prompt');

      expect(result.text).toBe('Fallback response');
      expect(result.provider).toBe('openrouter');
    });
  });

  describe('switchProvider', () => {
    it('should switch to different provider', () => {
      const router = new LLMRouter({
        primary: getDefaultConfig('ollama'),
      });

      expect(router.provider).toBe('ollama');

      router.switchProvider('groq', 'test-api-key');

      expect(router.provider).toBe('groq');
    });
  });

  describe('static methods', () => {
    it('getProviders should return all providers', () => {
      const providers = LLMRouter.getProviders();
      expect(providers.length).toBe(6);
    });

    it('getFreeTierProviders should return free providers', () => {
      const free = LLMRouter.getFreeTierProviders();
      expect(free.some(p => p.id === 'ollama')).toBe(true);
      expect(free.some(p => p.id === 'groq')).toBe(true);
    });

    it('fromSettings should create router', () => {
      const router = LLMRouter.fromSettings({
        provider: 'gemini',
        apiKey: 'test-key',
      });

      expect(router.provider).toBe('gemini');
    });
  });
});

describe('Field Pattern Matching', () => {
  it('should match common field patterns', () => {
    expect(matchFieldPattern('First Name')).toBe('firstName');
    expect(matchFieldPattern('Last Name')).toBe('lastName');
    expect(matchFieldPattern('Email Address')).toBe('email');
    expect(matchFieldPattern('Phone Number')).toBe('phone');
    expect(matchFieldPattern('LinkedIn URL')).toBe('linkedIn');
    expect(matchFieldPattern('Expected Salary')).toBe('salary');
  });

  it('should return null for unknown patterns', () => {
    expect(matchFieldPattern('Random Field')).toBeNull();
    expect(matchFieldPattern('xyz123')).toBeNull();
  });

  it('should be case insensitive', () => {
    expect(matchFieldPattern('FIRST NAME')).toBe('firstName');
    expect(matchFieldPattern('email address')).toBe('email');
  });
});
