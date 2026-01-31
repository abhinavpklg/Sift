import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsStorage } from '../shared/storage/SettingsStorage';
import { DEFAULT_SETTINGS } from '../shared/types/settings';

let mockStorage: Record<string, unknown> = {};

beforeEach(() => {
  mockStorage = {};
  
  vi.mocked(chrome.storage.local.get).mockImplementation(async (keys) => {
    if (typeof keys === 'string') return { [keys]: mockStorage[keys] };
    return mockStorage;
  });

  vi.mocked(chrome.storage.local.set).mockImplementation(async (items) => {
    Object.assign(mockStorage, items);
  });
});

describe('SettingsStorage', () => {
  describe('getAll', () => {
    it('should return defaults when no settings stored', async () => {
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
      expect(settings.general.autoSubmit).toBe(false);
    });
  });

  describe('update', () => {
    it('should update partial settings', async () => {
      await SettingsStorage.update({
        general: { dailyGoal: 15 },
      });

      const settings = await SettingsStorage.getAll();
      expect(settings.general.dailyGoal).toBe(15);
      expect(settings.general.autoSubmit).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset to defaults', async () => {
      await SettingsStorage.update({ general: { dailyGoal: 50 } });
      await SettingsStorage.reset();
      
      const settings = await SettingsStorage.getAll();
      expect(settings.general.dailyGoal).toBe(10);
    });
  });

  describe('General Settings', () => {
    it('should set daily goal with bounds', async () => {
      await SettingsStorage.setDailyGoal(150);
      let settings = await SettingsStorage.getAll();
      expect(settings.general.dailyGoal).toBe(100);

      await SettingsStorage.setDailyGoal(0);
      settings = await SettingsStorage.getAll();
      expect(settings.general.dailyGoal).toBe(1);
    });

    it('should toggle auto submit', async () => {
      await SettingsStorage.setAutoSubmit(true);
      const settings = await SettingsStorage.getAll();
      expect(settings.general.autoSubmit).toBe(true);
    });

    it('should set dark mode', async () => {
      await SettingsStorage.setDarkMode('dark');
      const settings = await SettingsStorage.getAll();
      expect(settings.general.darkMode).toBe('dark');
    });
  });

  describe('Scraping Settings', () => {
    it('should set time filter with bounds', async () => {
      await SettingsStorage.setTimeFilter(200);
      const settings = await SettingsStorage.getAll();
      expect(settings.scraping.timeFilterHours).toBe(168);
    });

    it('should toggle platforms', async () => {
      await SettingsStorage.togglePlatform('taleo', true);
      let settings = await SettingsStorage.getAll();
      expect(settings.scraping.enabledPlatforms).toContain('taleo');

      await SettingsStorage.togglePlatform('taleo', false);
      settings = await SettingsStorage.getAll();
      expect(settings.scraping.enabledPlatforms).not.toContain('taleo');
    });
  });

  describe('LLM Settings', () => {
    it('should set LLM provider with defaults', async () => {
      await SettingsStorage.setLLMProvider('openai', undefined, undefined, 'sk-test');
      
      const settings = await SettingsStorage.getAll();
      expect(settings.llm.provider).toBe('openai');
      expect(settings.llm.endpoint).toBe('https://api.openai.com/v1');
      expect(settings.llm.apiKey).toBe('sk-test');
    });

    it('should update LLM settings', async () => {
      await SettingsStorage.updateLLM({ temperature: 0.5 });
      
      const settings = await SettingsStorage.getAll();
      expect(settings.llm.temperature).toBe(0.5);
    });
  });

  describe('Credentials', () => {
    it('should save and retrieve credentials', async () => {
      await SettingsStorage.saveCredential('workday.com', 'user@test.com', 'password123');
      
      const cred = await SettingsStorage.getCredentialForDomain('workday.com');
      expect(cred).not.toBeNull();
      expect(cred?.username).toBe('user@test.com');
    });

    it('should decrypt password', async () => {
      await SettingsStorage.saveCredential('lever.co', 'user', 'mypassword');
      
      const cred = await SettingsStorage.getCredentialForDomain('lever.co');
      const password = SettingsStorage.decryptPassword(cred!.encryptedPassword);
      expect(password).toBe('mypassword');
    });

    it('should update existing credential', async () => {
      // Use unique domain for this test
      await SettingsStorage.saveCredential('unique-test.com', 'old@test.com', 'old');
      await SettingsStorage.saveCredential('unique-test.com', 'new@test.com', 'new');
      
      const cred = await SettingsStorage.getCredentialForDomain('unique-test.com');
      expect(cred?.username).toBe('new@test.com');
      
      // Verify only one credential for this domain
      const allCreds = await SettingsStorage.getCredentials();
      const matchingCreds = allCreds.filter(c => c.domain === 'unique-test.com');
      expect(matchingCreds).toHaveLength(1);
    });

    it('should delete credential', async () => {
      await SettingsStorage.saveCredential('delete.com', 'user', 'pass');
      await SettingsStorage.deleteCredential('delete.com');
      
      const cred = await SettingsStorage.getCredentialForDomain('delete.com');
      expect(cred).toBeNull();
    });
  });
});
