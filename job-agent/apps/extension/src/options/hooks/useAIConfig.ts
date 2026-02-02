/**
 * useAIConfig - Hook for AI/LLM configuration management
 * UPDATED: Added custom provider support
 */

import { useState, useEffect, useCallback } from 'react';
import type { LLMSettings } from '../../shared/types/settings';
import type { LLMProvider, CustomProvider, ProviderInfo } from '../../shared/llm/types';
import { PROVIDER_INFO } from '../../shared/llm/types';
import { SettingsStorage } from '../../shared/storage/SettingsStorage';

interface TestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

interface UseAIConfigReturn {
  config: LLMSettings | null;
  customProviders: CustomProvider[];
  allProviders: ProviderInfo[];
  isLoading: boolean;
  error: string | null;
  isTesting: boolean;
  testResult: TestResult | null;
  
  updateConfig: (updates: Partial<LLMSettings>) => Promise<void>;
  setProvider: (providerId: string) => Promise<void>;
  setModel: (model: string) => Promise<void>;
  setApiKey: (apiKey: string) => Promise<void>;
  setEndpoint: (endpoint: string) => Promise<void>;
  testConnection: () => Promise<TestResult>;
  resetToDefaults: () => Promise<void>;
  
  // Custom provider management
  addCustomProvider: (provider: Omit<CustomProvider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CustomProvider>;
  updateCustomProvider: (id: string, updates: Partial<CustomProvider>) => Promise<void>;
  deleteCustomProvider: (id: string) => Promise<void>;
  
  refresh: () => Promise<void>;
}

export function useAIConfig(): UseAIConfigReturn {
  const [config, setConfig] = useState<LLMSettings | null>(null);
  const [customProviders, setCustomProviders] = useState<CustomProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const settings = await SettingsStorage.getAll();
      setConfig(settings.llm);
      setCustomProviders(settings.customProviders || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load AI config');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Combine built-in and custom providers
  const allProviders: ProviderInfo[] = [
    ...Object.values(PROVIDER_INFO),
    ...customProviders.map(cp => ({
      id: cp.id,
      name: cp.name,
      description: cp.description,
      requiresApiKey: cp.apiKeyRequired,
      defaultEndpoint: cp.endpoint,
      defaultModel: cp.models[0]?.id || '',
      freetier: false,
      models: cp.models,
      isCustom: true,
    })),
  ];

  const updateConfig = async (updates: Partial<LLMSettings>) => {
    if (!config) return;
    
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    await SettingsStorage.updateLLM(updates);
    setTestResult(null);
  };

  const setProvider = async (providerId: string) => {
    // Check if it's a built-in provider
    const builtInProvider = PROVIDER_INFO[providerId];
    if (builtInProvider) {
      await updateConfig({
        provider: providerId as LLMProvider,
        endpoint: builtInProvider.defaultEndpoint,
        model: builtInProvider.defaultModel,
        customProviderId: undefined,
      });
      return;
    }

    // Check if it's a custom provider
    const customProvider = customProviders.find(cp => cp.id === providerId);
    if (customProvider) {
      await updateConfig({
        provider: 'custom',
        endpoint: customProvider.endpoint,
        model: customProvider.models[0]?.id || '',
        customProviderId: customProvider.id,
      });
    }
  };

  const setModel = async (model: string) => {
    await updateConfig({ model });
  };

  const setApiKey = async (apiKey: string) => {
    await updateConfig({ apiKey: apiKey || undefined });
  };

  const setEndpoint = async (endpoint: string) => {
    await updateConfig({ endpoint });
  };

  const testConnection = async (): Promise<TestResult> => {
    if (!config) {
      return { success: false, message: 'No configuration loaded' };
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const startTime = Date.now();
      let response: Response;
      
      const provider = config.provider;

      if (provider === 'ollama') {
        response = await fetch(`${config.endpoint}/api/tags`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (provider === 'openai' || provider === 'groq' || provider === 'openrouter' || provider === 'custom') {
        // OpenAI-compatible API
        response = await fetch(`${config.endpoint}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
      } else if (provider === 'anthropic') {
        response = await fetch(`${config.endpoint}/v1/messages`, {
          method: 'POST',
          headers: {
            'x-api-key': config.apiKey || '',
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });
      } else if (provider === 'gemini') {
        response = await fetch(
          `${config.endpoint}/models?key=${config.apiKey}`,
          { method: 'GET' }
        );
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const result: TestResult = {
          success: true,
          message: 'Connected successfully',
          latencyMs,
        };
        setTestResult(result);
        return result;
      } else {
        const errorText = await response.text();
        let message = `Connection failed (${response.status})`;
        
        try {
          const errorJson = JSON.parse(errorText);
          message = errorJson.error?.message || errorJson.message || message;
        } catch {
          if (errorText.length < 200) {
            message = errorText || message;
          }
        }

        const result: TestResult = { success: false, message };
        setTestResult(result);
        return result;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Connection failed';
      const result: TestResult = { success: false, message };
      setTestResult(result);
      return result;
    } finally {
      setIsTesting(false);
    }
  };

  const resetToDefaults = async () => {
    await SettingsStorage.resetSection('llm');
    await loadConfig();
    setTestResult(null);
  };

  // Custom provider management
  const addCustomProvider = async (
    providerData: Omit<CustomProvider, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomProvider> => {
    const now = new Date().toISOString();
    const newProvider: CustomProvider = {
      ...providerData,
      id: `custom-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...customProviders, newProvider];
    setCustomProviders(updated);
    await SettingsStorage.update({ customProviders: updated });

    return newProvider;
  };

  const updateCustomProvider = async (id: string, updates: Partial<CustomProvider>) => {
    const index = customProviders.findIndex(cp => cp.id === id);
    if (index === -1) return;

    const updated = [...customProviders];
    updated[index] = {
      ...updated[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setCustomProviders(updated);
    await SettingsStorage.update({ customProviders: updated });
  };

  const deleteCustomProvider = async (id: string) => {
    const updated = customProviders.filter(cp => cp.id !== id);
    setCustomProviders(updated);
    await SettingsStorage.update({ customProviders: updated });

    // If currently using this provider, switch to ollama
    if (config?.customProviderId === id) {
      await setProvider('ollama');
    }
  };

  return {
    config,
    customProviders,
    allProviders,
    isLoading,
    error,
    isTesting,
    testResult,
    updateConfig,
    setProvider,
    setModel,
    setApiKey,
    setEndpoint,
    testConnection,
    resetToDefaults,
    addCustomProvider,
    updateCustomProvider,
    deleteCustomProvider,
    refresh: loadConfig,
  };
}

export default useAIConfig;
