/**
 * SettingsStorage - Chrome Storage API wrapper for user settings
 * STORAGE-002: Settings management with defaults and migrations
 */

import type { 
  UserSettings, 
  GeneralSettings, 
  ScrapingSettings, 
  LLMSettings,
  EncryptedCredential,
  SettingsUpdate 
} from '../types/settings';
import { DEFAULT_SETTINGS, SETTINGS_VERSION } from '../types/settings';

const STORAGE_KEYS = {
  SETTINGS: 'sift_settings',
  SETTINGS_VERSION: 'sift_settings_version',
} as const;

export interface SettingsStorageEvents {
  onSettingsChanged?: (settings: UserSettings) => void;
}

/**
 * SettingsStorage Class
 * Manages user settings with defaults, validation, and migration support
 */
export class SettingsStorage {
  private static listeners: SettingsStorageEvents = {};
  private static initialized = false;

  /**
   * Initialize storage with change listeners
   */
  static init(events?: SettingsStorageEvents): void {
    if (this.initialized) return;

    if (events) {
      this.listeners = events;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      if (changes[STORAGE_KEYS.SETTINGS]) {
        const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue as UserSettings;
        this.listeners.onSettingsChanged?.(newSettings);
      }
    });

    this.initialized = true;
  }

  // ============================================
  // Core Settings Operations
  // ============================================

  /**
   * Get all settings (merged with defaults)
   */
  static async getAll(): Promise<UserSettings> {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.SETTINGS_VERSION,
    ]);

    const stored = result[STORAGE_KEYS.SETTINGS] as Partial<UserSettings> | undefined;
    const version = result[STORAGE_KEYS.SETTINGS_VERSION] as number | undefined;

    // Check if migration is needed
    if (version && version < SETTINGS_VERSION) {
      return this.migrateSettings(stored, version);
    }

    return this.mergeWithDefaults(stored);
  }

  /**
   * Save all settings
   */
  static async saveAll(settings: UserSettings): Promise<void> {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: settings,
      [STORAGE_KEYS.SETTINGS_VERSION]: SETTINGS_VERSION,
    });
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
    await this.saveAll({ ...DEFAULT_SETTINGS });
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Reset a specific section to defaults
   */
  static async resetSection(section: keyof Omit<UserSettings, 'credentials'>): Promise<UserSettings> {
    const current = await this.getAll();
    current[section] = { ...DEFAULT_SETTINGS[section] } as any;
    await this.saveAll(current);
    return current;
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
    const validGoal = Math.max(1, Math.min(100, goal));
    await this.updateGeneral({ dailyGoal: validGoal });
  }

  static async setDarkMode(mode: GeneralSettings['darkMode']): Promise<void> {
    await this.updateGeneral({ darkMode: mode });
  }

  static async toggleAutoSubmit(enabled?: boolean): Promise<boolean> {
    const current = await this.getGeneral();
    const newValue = enabled ?? !current.autoSubmit;
    await this.updateGeneral({ autoSubmit: newValue });
    return newValue;
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
    const validHours = Math.max(1, Math.min(168, hours)); // 1 hour to 1 week
    await this.updateScraping({ timeFilterHours: validHours });
  }

  static async setRequestDelay(min: number, max: number): Promise<void> {
    const validMin = Math.max(1, min);
    const validMax = Math.max(validMin, max);
    await this.updateScraping({ 
      requestDelayMin: validMin, 
      requestDelayMax: validMax 
    });
  }

  static async enablePlatform(platformId: string): Promise<void> {
    const scraping = await this.getScraping();
    if (!scraping.enabledPlatforms.includes(platformId)) {
      scraping.enabledPlatforms.push(platformId);
      await this.updateScraping({ enabledPlatforms: scraping.enabledPlatforms });
    }
  }

  static async disablePlatform(platformId: string): Promise<void> {
    const scraping = await this.getScraping();
    const index = scraping.enabledPlatforms.indexOf(platformId);
    if (index > -1) {
      scraping.enabledPlatforms.splice(index, 1);
      await this.updateScraping({ enabledPlatforms: scraping.enabledPlatforms });
    }
  }

  static async togglePlatform(platformId: string): Promise<boolean> {
    const scraping = await this.getScraping();
    const isEnabled = scraping.enabledPlatforms.includes(platformId);
    
    if (isEnabled) {
      await this.disablePlatform(platformId);
    } else {
      await this.enablePlatform(platformId);
    }
    
    return !isEnabled;
  }

  static async isPlatformEnabled(platformId: string): Promise<boolean> {
    const scraping = await this.getScraping();
    return scraping.enabledPlatforms.includes(platformId);
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
    provider: LLMSettings['provider'],
    endpoint?: string,
    model?: string,
    apiKey?: string
  ): Promise<void> {
    const updates: Partial<LLMSettings> = { provider };
    
    if (endpoint) updates.endpoint = endpoint;
    if (model) updates.model = model;
    if (apiKey !== undefined) updates.apiKey = apiKey;

    // Set default endpoints based on provider
    if (!endpoint) {
      switch (provider) {
        case 'ollama':
          updates.endpoint = 'http://localhost:11434';
          break;
        case 'openai':
          updates.endpoint = 'https://api.openai.com/v1';
          break;
        case 'anthropic':
          updates.endpoint = 'https://api.anthropic.com';
          break;
      }
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
    
    // Simple encoding (in production, use proper encryption)
    const encryptedPassword = btoa(password);

    const existingIndex = settings.credentials.findIndex(c => c.domain === domain);

    const credential: EncryptedCredential = {
      id: existingIndex >= 0 
        ? settings.credentials[existingIndex].id 
        : crypto.randomUUID(),
      domain,
      username,
      encryptedPassword,
      createdAt: existingIndex >= 0 
        ? settings.credentials[existingIndex].createdAt 
        : now,
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

  static async clearAllCredentials(): Promise<void> {
    await this.update({ credentials: [] });
  }

  /**
   * Decode password (simple base64 for now)
   * In production, implement proper decryption
   */
  static decryptPassword(encryptedPassword: string): string {
    try {
      return atob(encryptedPassword);
    } catch {
      return '';
    }
  }

  // ============================================
  // Migration Support
  // ============================================

  /**
   * Migrate settings from older versions
   */
  private static async migrateSettings(
    stored: Partial<UserSettings> | undefined,
    _fromVersion: number
  ): Promise<UserSettings> {
    let settings = this.mergeWithDefaults(stored);

    // Add migration logic here as versions increase
    // Example:
    // if (fromVersion < 2) {
    //   settings = this.migrateV1toV2(settings);
    // }

    // Save migrated settings
    await this.saveAll(settings);
    
    return settings;
  }

  /**
   * Deep merge stored settings with defaults
   */
  private static mergeWithDefaults(stored?: Partial<UserSettings>): UserSettings {
    if (!stored) return { ...DEFAULT_SETTINGS, credentials: [] };

    return {
      general: { ...DEFAULT_SETTINGS.general, ...stored.general },
      scraping: { 
        ...DEFAULT_SETTINGS.scraping, 
        ...stored.scraping,
        // Ensure enabledPlatforms is always an array
        enabledPlatforms: stored.scraping?.enabledPlatforms ?? DEFAULT_SETTINGS.scraping.enabledPlatforms,
      },
      llm: { ...DEFAULT_SETTINGS.llm, ...stored.llm },
      credentials: stored.credentials ?? [],
    };
  }

  // ============================================
  // Export/Import
  // ============================================

  /**
   * Export settings (excludes credentials for security)
   */
  static async export(): Promise<string> {
    const settings = await this.getAll();
    
    // Remove sensitive data
    const exportData = {
      ...settings,
      credentials: [], // Don't export credentials
      llm: {
        ...settings.llm,
        apiKey: undefined, // Don't export API keys
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import settings
   */
  static async import(jsonString: string): Promise<UserSettings> {
    let data: Partial<UserSettings>;

    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    // Merge with defaults to ensure all fields exist
    const settings = this.mergeWithDefaults(data);
    
    // Preserve existing credentials and API key
    const current = await this.getAll();
    settings.credentials = current.credentials;
    if (current.llm.apiKey) {
      settings.llm.apiKey = current.llm.apiKey;
    }

    await this.saveAll(settings);
    return settings;
  }
}

export default SettingsStorage;
