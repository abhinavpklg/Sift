import type { 
  UserSettings, 
  GeneralSettings, 
  ScrapingSettings, 
  LLMSettings,
  EncryptedCredential 
} from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

const STORAGE_KEY = 'sift_settings';

// Update input type - allows partial nested objects
interface SettingsUpdate {
  general?: Partial<GeneralSettings>;
  scraping?: Partial<ScrapingSettings>;
  llm?: Partial<LLMSettings>;
  credentials?: EncryptedCredential[];
}

/**
 * SettingsStorage - Manages user settings in Chrome Storage
 */
export class SettingsStorage {
  /**
   * Get all settings (merged with defaults)
   */
  static async getAll(): Promise<UserSettings> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as SettingsUpdate | undefined;
    return this.mergeWithDefaults(stored);
  }

  /**
   * Save all settings
   */
  static async saveAll(settings: UserSettings): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: settings });
  }

  /**
   * Update settings (partial update, merged with existing)
   */
  static async update(updates: SettingsUpdate): Promise<UserSettings> {
    const current = await this.getAll();
    
    const updated: UserSettings = {
      general: { ...current.general, ...updates.general },
      scraping: { ...current.scraping, ...updates.scraping },
      llm: { ...current.llm, ...updates.llm },
      credentials: updates.credentials ?? current.credentials,
    };

    await this.saveAll(updated);
    return updated;
  }

  /**
   * Reset settings to defaults
   */
  static async reset(): Promise<UserSettings> {
    await this.saveAll(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  // ============================================
  // General Settings
  // ============================================

  static async getGeneral(): Promise<GeneralSettings> {
    const settings = await this.getAll();
    return settings.general;
  }

  static async updateGeneral(updates: Partial<GeneralSettings>): Promise<GeneralSettings> {
    const settings = await this.getAll();
    settings.general = { ...settings.general, ...updates };
    await this.saveAll(settings);
    return settings.general;
  }

  static async setDailyGoal(goal: number): Promise<void> {
    await this.updateGeneral({ dailyGoal: Math.max(1, Math.min(100, goal)) });
  }

  static async setAutoSubmit(enabled: boolean): Promise<void> {
    await this.updateGeneral({ autoSubmit: enabled });
  }

  static async setAutoNextPage(enabled: boolean): Promise<void> {
    await this.updateGeneral({ autoNextPage: enabled });
  }

  static async setDarkMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    await this.updateGeneral({ darkMode: mode });
  }

  // ============================================
  // Scraping Settings
  // ============================================

  static async getScraping(): Promise<ScrapingSettings> {
    const settings = await this.getAll();
    return settings.scraping;
  }

  static async updateScraping(updates: Partial<ScrapingSettings>): Promise<ScrapingSettings> {
    const settings = await this.getAll();
    settings.scraping = { ...settings.scraping, ...updates };
    await this.saveAll(settings);
    return settings.scraping;
  }

  static async setTimeFilter(hours: number): Promise<void> {
    await this.updateScraping({ timeFilterHours: Math.max(1, Math.min(168, hours)) });
  }

  static async setEnabledPlatforms(platforms: string[]): Promise<void> {
    await this.updateScraping({ enabledPlatforms: platforms });
  }

  static async togglePlatform(platformId: string, enabled: boolean): Promise<void> {
    const scraping = await this.getScraping();
    const platforms = new Set(scraping.enabledPlatforms);
    
    if (enabled) {
      platforms.add(platformId);
    } else {
      platforms.delete(platformId);
    }
    
    await this.setEnabledPlatforms(Array.from(platforms));
  }

  // ============================================
  // LLM Settings
  // ============================================

  static async getLLM(): Promise<LLMSettings> {
    const settings = await this.getAll();
    return settings.llm;
  }

  static async updateLLM(updates: Partial<LLMSettings>): Promise<LLMSettings> {
    const settings = await this.getAll();
    settings.llm = { ...settings.llm, ...updates };
    await this.saveAll(settings);
    return settings.llm;
  }

  static async setLLMProvider(
    provider: 'ollama' | 'openai' | 'anthropic' | 'custom',
    endpoint?: string,
    model?: string,
    apiKey?: string
  ): Promise<void> {
    const updates: Partial<LLMSettings> = { provider };
    
    if (endpoint) updates.endpoint = endpoint;
    if (model) updates.model = model;
    if (apiKey !== undefined) updates.apiKey = apiKey;
    
    if (provider === 'ollama' && !endpoint) {
      updates.endpoint = 'http://localhost:11434';
      updates.model = model || 'llama3.2:8b-instruct-q4_K_M';
    } else if (provider === 'openai' && !endpoint) {
      updates.endpoint = 'https://api.openai.com/v1';
      updates.model = model || 'gpt-4o-mini';
    } else if (provider === 'anthropic' && !endpoint) {
      updates.endpoint = 'https://api.anthropic.com/v1';
      updates.model = model || 'claude-3-haiku-20240307';
    }
    
    await this.updateLLM(updates);
  }

  // ============================================
  // Credentials Management
  // ============================================

  static async getCredentials(): Promise<EncryptedCredential[]> {
    const settings = await this.getAll();
    return settings.credentials;
  }

  static async getCredentialForDomain(domain: string): Promise<EncryptedCredential | null> {
    const credentials = await this.getCredentials();
    return credentials.find(c => c.domain === domain) || null;
  }

  static async saveCredential(
    domain: string,
    username: string,
    password: string
  ): Promise<EncryptedCredential> {
    const settings = await this.getAll();
    const now = new Date().toISOString();
    const encryptedPassword = btoa(password);
    
    const existingIndex = settings.credentials.findIndex(c => c.domain === domain);
    
    const credential: EncryptedCredential = {
      id: existingIndex >= 0 ? settings.credentials[existingIndex].id : crypto.randomUUID(),
      domain,
      username,
      encryptedPassword,
      createdAt: existingIndex >= 0 ? settings.credentials[existingIndex].createdAt : now,
      updatedAt: now,
    };
    
    if (existingIndex >= 0) {
      settings.credentials[existingIndex] = credential;
    } else {
      settings.credentials.push(credential);
    }
    
    await this.saveAll(settings);
    return credential;
  }

  static async deleteCredential(domain: string): Promise<boolean> {
    const settings = await this.getAll();
    const index = settings.credentials.findIndex(c => c.domain === domain);
    
    if (index === -1) return false;
    
    settings.credentials.splice(index, 1);
    await this.saveAll(settings);
    return true;
  }

  static decryptPassword(encryptedPassword: string): string {
    return atob(encryptedPassword);
  }

  // ============================================
  // Helpers
  // ============================================

  private static mergeWithDefaults(stored?: SettingsUpdate): UserSettings {
    if (!stored) return { ...DEFAULT_SETTINGS };
    
    return {
      general: { ...DEFAULT_SETTINGS.general, ...stored.general },
      scraping: { ...DEFAULT_SETTINGS.scraping, ...stored.scraping },
      llm: { ...DEFAULT_SETTINGS.llm, ...stored.llm },
      credentials: stored.credentials ?? [],
    };
  }
}

export default SettingsStorage;
