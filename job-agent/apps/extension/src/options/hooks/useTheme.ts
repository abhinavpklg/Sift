/**
 * useTheme - Theme management hook
 * Default: dark mode
 */

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sift_theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const savedTheme = result[STORAGE_KEY] as Theme;
      // Default to dark if not set
      const initialTheme = savedTheme || 'dark';
      setThemeState(initialTheme);
      applyTheme(initialTheme);
      setIsLoaded(true);
    });
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    chrome.storage.local.set({ [STORAGE_KEY]: newTheme });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return { theme, setTheme, toggleTheme, isLoaded };
}
