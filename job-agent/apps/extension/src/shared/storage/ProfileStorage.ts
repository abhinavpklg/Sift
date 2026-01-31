import type { UserProfile } from '../types/profile';
import { createEmptyProfile } from '../types/profile';

export interface StorageUsage {
  used: number;
  total: number;
  percentage: number;
}

const STORAGE_KEYS = {
  PROFILES: 'sift_profiles',
  ACTIVE_PROFILE_ID: 'sift_active_profile_id',
} as const;

export class ProfileStorage {
  static async getAll(): Promise<UserProfile[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.PROFILES);
    return (result[STORAGE_KEYS.PROFILES] as UserProfile[]) || [];
  }

  static async getById(profileId: string): Promise<UserProfile | null> {
    const profiles = await this.getAll();
    return profiles.find(p => p.id === profileId) || null;
  }

  static async getActive(): Promise<UserProfile | null> {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.PROFILES,
      STORAGE_KEYS.ACTIVE_PROFILE_ID,
    ]);
    const profiles = (result[STORAGE_KEYS.PROFILES] as UserProfile[]) || [];
    const activeId = result[STORAGE_KEYS.ACTIVE_PROFILE_ID] as string;
    if (!activeId) return null;
    return profiles.find(p => p.id === activeId) || null;
  }

  static async setActive(profileId: string): Promise<void> {
    const profiles = await this.getAll();
    if (!profiles.some(p => p.id === profileId)) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    const updated = profiles.map(p => ({ ...p, isActive: p.id === profileId }));
    await chrome.storage.local.set({
      [STORAGE_KEYS.PROFILES]: updated,
      [STORAGE_KEYS.ACTIVE_PROFILE_ID]: profileId,
    });
  }

  static async create(
    data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>> = {}
  ): Promise<UserProfile> {
    const profiles = await this.getAll();
    const empty = createEmptyProfile(data.name || 'New Profile');
    const newProfile: UserProfile = {
      ...empty,
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: profiles.length === 0,
    };
    profiles.push(newProfile);
    
    const updates: Record<string, unknown> = { [STORAGE_KEYS.PROFILES]: profiles };
    if (newProfile.isActive) {
      updates[STORAGE_KEYS.ACTIVE_PROFILE_ID] = newProfile.id;
    }
    await chrome.storage.local.set(updates);
    return newProfile;
  }

  static async update(
    profileId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
  ): Promise<UserProfile | null> {
    const profiles = await this.getAll();
    const index = profiles.findIndex(p => p.id === profileId);
    if (index === -1) return null;

    profiles[index] = {
      ...profiles[index],
      ...updates,
      id: profileId,
      createdAt: profiles[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    await chrome.storage.local.set({ [STORAGE_KEYS.PROFILES]: profiles });
    return profiles[index];
  }

  static async delete(profileId: string): Promise<boolean> {
    const profiles = await this.getAll();
    const index = profiles.findIndex(p => p.id === profileId);
    if (index === -1) return false;

    const wasActive = profiles[index].isActive;
    profiles.splice(index, 1);

    const updates: Record<string, unknown> = { [STORAGE_KEYS.PROFILES]: profiles };
    if (wasActive) {
      if (profiles.length > 0) {
        profiles[0].isActive = true;
        updates[STORAGE_KEYS.ACTIVE_PROFILE_ID] = profiles[0].id;
      } else {
        updates[STORAGE_KEYS.ACTIVE_PROFILE_ID] = null;
      }
    }
    await chrome.storage.local.set(updates);
    return true;
  }

  static async duplicate(profileId: string): Promise<UserProfile | null> {
    const original = await this.getById(profileId);
    if (!original) return null;
    const { id, createdAt, updatedAt, isActive, ...data } = original;
    return this.create({ ...data, name: `${original.name} (Copy)` });
  }

  static async export(profileId: string): Promise<string | null> {
    const profile = await this.getById(profileId);
    if (!profile) return null;
    const { id, isActive, createdAt, updatedAt, ...exportData } = profile;
    return JSON.stringify(exportData, null, 2);
  }

  static async import(jsonString: string): Promise<UserProfile> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }
    const data = parsed as Partial<UserProfile>;
    return this.create({
      ...data,
      name: data.name ? `${data.name} (Imported)` : 'Imported Profile',
    });
  }

  static async clearAll(): Promise<void> {
    await chrome.storage.local.remove([
      STORAGE_KEYS.PROFILES,
      STORAGE_KEYS.ACTIVE_PROFILE_ID,
    ]);
  }

  static async getStorageUsage(): Promise<StorageUsage> {
    const data = await chrome.storage.local.get(null);
    const used = new Blob([JSON.stringify(data)]).size;
    const total = chrome.storage.local.QUOTA_BYTES || 10485760; // 10MB default

    return {
      used,
      total,
      percentage: Math.round((used / total) * 100),
    };
  }

  /**
   * Check if storage has any profiles
   */
  static async hasProfiles(): Promise<boolean> {
    const count = await this.getCount();
    return count > 0;
  }

  /**
   * Get profile count
   */
  static async getCount(): Promise<number> {
    const profiles = await this.getAll();
    return profiles.length;
  }

  /**
   * Search profiles by name
   */
  static async searchByName(query: string): Promise<UserProfile[]> {
    const profiles = await this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return profiles.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.personalInfo.firstName.toLowerCase().includes(lowerQuery) ||
      p.personalInfo.lastName.toLowerCase().includes(lowerQuery)
    );
  }

}

export default ProfileStorage;
