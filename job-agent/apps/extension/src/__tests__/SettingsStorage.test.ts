/**
 * SettingsStorage Unit Tests
 * STORAGE-002: Test suite for settings operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsStorage } from '../shared/storage/SettingsStorage';
import { DEFAULT_SETTINGS } from '../shared/types/settings';

// Mock Chrome Storage API
const mockStorage: Record<string, unknown> = {};

const mockChromeStorage = {
  local: {
    get: vi.fn((keys) => {
      if (typeof keys === 'string') {
        return Promise.resolve({ [keys]: mockStorage[keys] });
      }
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        keys.forEach(k => { result[k] = mockStorage[k]; });
        return Promise.resolve(result);
      }
      return Promise.resolve(mockStorage);
    }),
    set: vi.fn((items) => {
      Object.assign(mockStorage, items);
      return Promise.resolve();
    }),
    remove: vi.fn((keys) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach(k => delete mockStorage[k]);
      return Promise.resolve();
    }),
  },
  onChanged: {
    addListener: vi.fn(),
  },
};

// @ts-expect-error - Mock chrome global
global.chrome = { storage: mockChromeStorage };

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
});

describe('SettingsStorage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return default settings when none exist', async () => {
      const settings = await SettingsStorage.getAll();
      
      expect(settings.general.dailyGoal).toBe(DEFAULT_SETTINGS.general.dailyGoal);
      expect(settings.llm.provider).toBe('ollama');
    });

    it('should merge stored settings with defaults', async () => {
      mockStorage['sift_settings'] = {
        general: { dailyGoal: 20 },
      };

      const settings = await SettingsStorage.getAll();
      
      expect(settings.general.dailyGoal).toBe(20);
      expect(settings.general.autoSubmit).toBe(DEFAULT_SETTINGS.general.autoSubmit);
    });
  });

  describe('update', () => {
    it('should update partial settings', async () => {
      const settings = await SettingsStorage.update({
        general: { dailyGoal: 25 },
      });

      expect(settings.general.dailyGoal).toBe(25);
      expect(settings.general.autoSubmit).toBe(false);
    });

    it('should preserve unmodified sections', async () => {
      await SettingsStorage.update({ general: { dailyGoal: 15 } });
      const settings = await SettingsStorage.update({ 
        llm: { provider: 'openai' } 
      });

      expect(settings.general.dailyGoal).toBe(15);
      expect(settings.llm.provider).toBe('openai');
    });
  });

  describe('reset', () => {
    it('should reset all settings to defaults', async () => {
      await SettingsStorage.update({ general: { dailyGoal: 50 } });
      const settings = await SettingsStorage.reset();

      expect(settings.general.dailyGoal).toBe(DEFAULT_SETTINGS.general.dailyGoal);
    });
  });

  describe('General Settings', () => {
    it('should get general settings', async () => {
      const general = await SettingsStorage.getGeneral();
      expect(general.dailyGoal).toBe(10);
    });

    it('should update daily goal with validation', async () => {
      await SettingsStorage.setDailyGoal(150); // Over max
      let general = await SettingsStorage.getGeneral();
      expect(general.dailyGoal).toBe(100); // Capped at max

      await SettingsStorage.setDailyGoal(-5); // Under min
      general = await SettingsStorage.getGeneral();
      expect(general.dailyGoal).toBe(1); // Minimum 1
    });

    it('should toggle auto submit', async () => {
      const result1 = await SettingsStorage.toggleAutoSubmit();
      expect(result1).toBe(true);

      const result2 = await SettingsStorage.toggleAutoSubmit();
      expect(result2).toBe(false);
    });
  });

  describe('Scraping Settings', () => {
    it('should get scraping settings', async () => {
      const scraping = await SettingsStorage.getScraping();
      expect(scraping.timeFilterHours).toBe(24);
    });

    it('should enable/disable platforms', async () => {
      await SettingsStorage.disablePlatform('greenhouse.io');
      let enabled = await SettingsStorage.isPlatformEnabled('greenhouse.io');
      expect(enabled).toBe(false);

      await SettingsStorage.enablePlatform('greenhouse.io');
      enabled = await SettingsStorage.isPlatformEnabled('greenhouse.io');
      expect(enabled).toBe(true);
    });

    it('should toggle platform', async () => {
      const wasEnabled = await SettingsStorage.isPlatformEnabled('lever.co');
      const newState = await SettingsStorage.togglePlatform('lever.co');
      expect(newState).toBe(!wasEnabled);
    });

    it('should validate time filter', async () => {
      await SettingsStorage.setTimeFilter(200); // Over max
      let scraping = await SettingsStorage.getScraping();
      expect(scraping.timeFilterHours).toBe(168); // Capped at 1 week

      await SettingsStorage.setTimeFilter(0); // Under min
      scraping = await SettingsStorage.getScraping();
      expect(scraping.timeFilterHours).toBe(1); // Minimum 1
    });
  });

  describe('LLM Settings', () => {
    it('should get LLM settings', async () => {
      const llm = await SettingsStorage.getLLM();
      expect(llm.provider).toBe('ollama');
      expect(llm.endpoint).toBe('http://localhost:11434');
    });

    it('should set LLM provider with defaults', async () => {
      await SettingsStorage.setLLMProvider('openai');
      const llm = await SettingsStorage.getLLM();
      
      expect(llm.provider).toBe('openai');
      expect(llm.endpoint).toBe('https://api.openai.com/v1');
    });

    it('should set custom endpoint', async () => {
      await SettingsStorage.setLLMProvider('ollama', 'http://my-server:8080');
      const llm = await SettingsStorage.getLLM();
      
      expect(llm.provider).toBe('ollama');
      expect(llm.endpoint).toBe('http://my-server:8080');
    });
  });

  describe('Credentials', () => {
    it('should save and retrieve credentials', async () => {
      await SettingsStorage.saveCredential('workday.com', 'user@test.com', 'secret123');
      
      const credential = await SettingsStorage.getCredentialForDomain('workday.com');
      
      expect(credential).not.toBeNull();
      expect(credential?.username).toBe('user@test.com');
    });

    it('should update existing credential', async () => {
      await SettingsStorage.saveCredential('workday.com', 'old@test.com', 'old');
      await SettingsStorage.saveCredential('workday.com', 'new@test.com', 'new');
      
      const credentials = await SettingsStorage.getCredentials();
      expect(credentials).toHaveLength(1);
      expect(credentials[0].username).toBe('new@test.com');
    });

    it('should delete credential', async () => {
      await SettingsStorage.saveCredential('test.com', 'user', 'pass');
      const deleted = await SettingsStorage.deleteCredential('test.com');
      
      expect(deleted).toBe(true);
      
      const credential = await SettingsStorage.getCredentialForDomain('test.com');
      expect(credential).toBeNull();
    });

    it('should encrypt and decrypt password', async () => {
      await SettingsStorage.saveCredential('test.com', 'user', 'mypassword');
      
      const credential = await SettingsStorage.getCredentialForDomain('test.com');
      const decrypted = SettingsStorage.decryptPassword(credential!.encryptedPassword);
      
      expect(decrypted).toBe('mypassword');
    });
  });

  describe('Export/Import', () => {
    it('should export settings without sensitive data', async () => {
      await SettingsStorage.saveCredential('test.com', 'user', 'secret');
      await SettingsStorage.updateLLM({ apiKey: 'sk-secret-key' });
      
      const exported = await SettingsStorage.export();
      const parsed = JSON.parse(exported);
      
      expect(parsed.credentials).toHaveLength(0);
      expect(parsed.llm.apiKey).toBeUndefined();
    });

    it('should import settings and preserve credentials', async () => {
      await SettingsStorage.saveCredential('test.com', 'user', 'secret');
      
      const importData = JSON.stringify({
        general: { dailyGoal: 30 },
      });
      
      const settings = await SettingsStorage.import(importData);
      
      expect(settings.general.dailyGoal).toBe(30);
      expect(settings.credentials).toHaveLength(1);
    });
  });
});
