/**
 * useSettings Hook - Manages general and scraping settings
 * OPTIONS-004: Settings management
 */

import { useState, useEffect, useCallback } from 'react';
import { SettingsStorage } from '../../shared/storage/SettingsStorage';
import { ProfileStorage } from '../../shared/storage/ProfileStorage';
import { JobStorage } from '../../shared/storage/JobStorage';
import type { GeneralSettings, ScrapingSettings } from '../../shared/types/settings';
import { DEFAULT_SETTINGS, ATS_PLATFORMS } from '../../shared/types/settings';

interface UseSettingsReturn {
  // State
  general: GeneralSettings;
  scraping: ScrapingSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
  
  // General Settings Actions
  updateGeneral: (updates: Partial<GeneralSettings>) => Promise<void>;
  resetGeneral: () => Promise<void>;
  
  // Scraping Settings Actions
  updateScraping: (updates: Partial<ScrapingSettings>) => Promise<void>;
  togglePlatform: (platformId: string) => Promise<void>;
  enableAllPlatforms: () => Promise<void>;
  disableAllPlatforms: () => Promise<void>;
  resetScraping: () => Promise<void>;
  
  // Danger Zone Actions
  resetAllSettings: () => Promise<void>;
  clearAllData: () => Promise<void>;
  exportSettings: () => Promise<void>;
  importSettings: (jsonString: string) => Promise<void>;
  
  // Helpers
  platforms: typeof ATS_PLATFORMS;
  isPlatformEnabled: (platformId: string) => boolean;
  clearMessages: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_SETTINGS.general);
  const [scraping, setScraping] = useState<ScrapingSettings>(DEFAULT_SETTINGS.scraping);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await SettingsStorage.getAll();
      setGeneral(settings.general);
      setScraping(settings.scraping);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Load settings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // ============================================
  // General Settings Actions
  // ============================================

  const updateGeneral = useCallback(async (updates: Partial<GeneralSettings>) => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await SettingsStorage.updateGeneral(updates);
      setGeneral(updated);
      setSuccessMessage('Settings saved');
    } catch (err) {
      setError('Failed to save settings');
      console.error('Update general error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const resetGeneral = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      await SettingsStorage.resetSection('general');
      setGeneral(DEFAULT_SETTINGS.general);
      setSuccessMessage('General settings reset to defaults');
    } catch (err) {
      setError('Failed to reset settings');
      console.error('Reset general error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ============================================
  // Scraping Settings Actions
  // ============================================

  const updateScraping = useCallback(async (updates: Partial<ScrapingSettings>) => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await SettingsStorage.updateScraping(updates);
      setScraping(updated);
      setSuccessMessage('Scraping settings saved');
    } catch (err) {
      setError('Failed to save scraping settings');
      console.error('Update scraping error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const togglePlatform = useCallback(async (platformId: string) => {
    const newEnabled = scraping.enabledPlatforms.includes(platformId)
      ? scraping.enabledPlatforms.filter(p => p !== platformId)
      : [...scraping.enabledPlatforms, platformId];
    
    await updateScraping({ enabledPlatforms: newEnabled });
  }, [scraping.enabledPlatforms, updateScraping]);

  const enableAllPlatforms = useCallback(async () => {
    await updateScraping({ 
      enabledPlatforms: ATS_PLATFORMS.map(p => p.id) 
    });
  }, [updateScraping]);

  const disableAllPlatforms = useCallback(async () => {
    await updateScraping({ enabledPlatforms: [] });
  }, [updateScraping]);

  const resetScraping = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      await SettingsStorage.resetSection('scraping');
      setScraping(DEFAULT_SETTINGS.scraping);
      setSuccessMessage('Scraping settings reset to defaults');
    } catch (err) {
      setError('Failed to reset scraping settings');
      console.error('Reset scraping error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const isPlatformEnabled = useCallback((platformId: string) => {
    return scraping.enabledPlatforms.includes(platformId);
  }, [scraping.enabledPlatforms]);

  // ============================================
  // Danger Zone Actions
  // ============================================

  const resetAllSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      const defaults = await SettingsStorage.reset();
      setGeneral(defaults.general);
      setScraping(defaults.scraping);
      setSuccessMessage('All settings reset to defaults');
    } catch (err) {
      setError('Failed to reset settings');
      console.error('Reset all error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Clear profiles
      const profiles = await ProfileStorage.getAll();
      for (const profile of profiles) {
        await ProfileStorage.delete(profile.id);
      }
      
      // Clear jobs
      await JobStorage.clearAll();
      
      // Reset settings
      const defaults = await SettingsStorage.reset();
      setGeneral(defaults.general);
      setScraping(defaults.scraping);
      
      setSuccessMessage('All data cleared successfully');
    } catch (err) {
      setError('Failed to clear data');
      console.error('Clear all data error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const exportSettings = useCallback(async () => {
    try {
      const json = await SettingsStorage.export();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sift-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMessage('Settings exported');
    } catch (err) {
      setError('Failed to export settings');
      console.error('Export error:', err);
    }
  }, []);

  const importSettings = useCallback(async (jsonString: string) => {
    try {
      setIsSaving(true);
      setError(null);
      const settings = await SettingsStorage.import(jsonString);
      setGeneral(settings.general);
      setScraping(settings.scraping);
      setSuccessMessage('Settings imported successfully');
    } catch (err) {
      setError('Failed to import settings: Invalid format');
      console.error('Import error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    general,
    scraping,
    isLoading,
    isSaving,
    error,
    successMessage,
    updateGeneral,
    resetGeneral,
    updateScraping,
    togglePlatform,
    enableAllPlatforms,
    disableAllPlatforms,
    resetScraping,
    resetAllSettings,
    clearAllData,
    exportSettings,
    importSettings,
    platforms: ATS_PLATFORMS,
    isPlatformEnabled,
    clearMessages,
  };
}
