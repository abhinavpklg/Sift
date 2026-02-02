/**
 * useProfiles - Hook for profile management
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../../shared/types/profile';

const STORAGE_KEYS = {
  PROFILES: 'sift_profiles',
  ACTIVE_PROFILE_ID: 'sift_active_profile_id',
};

interface UseProfilesReturn {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserProfile>;
  updateProfile: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string) => Promise<void>;
  duplicateProfile: (id: string) => Promise<UserProfile>;
  exportProfile: (id: string) => void;
  importProfile: (file: File) => Promise<UserProfile>;
  refresh: () => Promise<void>;
}

export function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.PROFILES,
        STORAGE_KEYS.ACTIVE_PROFILE_ID,
      ]);
      
      const loadedProfiles = (result[STORAGE_KEYS.PROFILES] as UserProfile[]) || [];
      const activeId = result[STORAGE_KEYS.ACTIVE_PROFILE_ID] as string;
      
      setProfiles(loadedProfiles);
      
      if (activeId) {
        const active = loadedProfiles.find(p => p.id === activeId) || null;
        setActiveProfileState(active);
      } else {
        setActiveProfileState(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const createProfile = async (
    profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserProfile> => {
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      ...profileData,
      id: `profile-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedProfiles = [...profiles, newProfile];
    
    const updates: Record<string, unknown> = {
      [STORAGE_KEYS.PROFILES]: updatedProfiles,
    };
    
    // Set as active if it's the first profile or marked as active
    if (updatedProfiles.length === 1 || newProfile.isActive) {
      updates[STORAGE_KEYS.ACTIVE_PROFILE_ID] = newProfile.id;
      // Deactivate other profiles
      updatedProfiles.forEach(p => {
        if (p.id !== newProfile.id) p.isActive = false;
      });
      newProfile.isActive = true;
    }

    await chrome.storage.local.set(updates);
    await loadProfiles();
    
    return newProfile;
  };

  const updateProfile = async (id: string, updates: Partial<UserProfile>): Promise<void> => {
    const profileIndex = profiles.findIndex(p => p.id === id);
    if (profileIndex === -1) throw new Error('Profile not found');

    const updatedProfile = {
      ...profiles[profileIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedProfiles = [...profiles];
    updatedProfiles[profileIndex] = updatedProfile;

    await chrome.storage.local.set({
      [STORAGE_KEYS.PROFILES]: updatedProfiles,
    });

    await loadProfiles();
  };

  const deleteProfile = async (id: string): Promise<void> => {
    const updatedProfiles = profiles.filter(p => p.id !== id);
    
    const updates: Record<string, unknown> = {
      [STORAGE_KEYS.PROFILES]: updatedProfiles,
    };

    // If deleting active profile, set new active
    if (activeProfile?.id === id) {
      if (updatedProfiles.length > 0) {
        updates[STORAGE_KEYS.ACTIVE_PROFILE_ID] = updatedProfiles[0].id;
        updatedProfiles[0].isActive = true;
      } else {
        updates[STORAGE_KEYS.ACTIVE_PROFILE_ID] = null;
      }
    }

    await chrome.storage.local.set(updates);
    await loadProfiles();
  };

  const setActiveProfile = async (id: string): Promise<void> => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');

    // Update all profiles' isActive status
    const updatedProfiles = profiles.map(p => ({
      ...p,
      isActive: p.id === id,
    }));

    await chrome.storage.local.set({
      [STORAGE_KEYS.PROFILES]: updatedProfiles,
      [STORAGE_KEYS.ACTIVE_PROFILE_ID]: id,
    });

    await loadProfiles();
  };

  const duplicateProfile = async (id: string): Promise<UserProfile> => {
    const original = profiles.find(p => p.id === id);
    if (!original) throw new Error('Profile not found');

    const duplicate = {
      ...original,
      name: `${original.name} (Copy)`,
      isActive: false,
    };

    // Remove id, createdAt, updatedAt for createProfile
    const { id: _, createdAt: __, updatedAt: ___, ...profileData } = duplicate;
    
    return createProfile(profileData);
  };

  const exportProfile = (id: string): void => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');

    const dataStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sift-profile-${profile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const importProfile = async (file: File): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content) as UserProfile;
          
          // Validate basic structure
          if (!imported.personalInfo || !imported.name) {
            throw new Error('Invalid profile format');
          }

          // Create as new profile
          const { id: _, createdAt: __, updatedAt: ___, ...profileData } = imported;
          profileData.name = `${imported.name} (Imported)`;
          profileData.isActive = false;
          
          const newProfile = await createProfile(profileData);
          resolve(newProfile);
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to import profile'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return {
    profiles,
    activeProfile,
    isLoading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    duplicateProfile,
    exportProfile,
    importProfile,
    refresh: loadProfiles,
  };
}

export default useProfiles;
