import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileStorage } from '../shared/storage/ProfileStorage';

let mockStorage: Record<string, unknown> = {};

beforeEach(() => {
  mockStorage = {};
  
  vi.mocked(chrome.storage.local.get).mockImplementation(async (keys) => {
    if (typeof keys === 'string') return { [keys]: mockStorage[keys] };
    if (Array.isArray(keys)) {
      const result: Record<string, unknown> = {};
      keys.forEach(key => { if (mockStorage[key] !== undefined) result[key] = mockStorage[key]; });
      return result;
    }
    return mockStorage;
  });

  vi.mocked(chrome.storage.local.set).mockImplementation(async (items) => {
    Object.assign(mockStorage, items);
  });

  vi.mocked(chrome.storage.local.remove).mockImplementation(async (keys) => {
    (Array.isArray(keys) ? keys : [keys]).forEach(key => delete mockStorage[key]);
  });
});

describe('ProfileStorage', () => {
  describe('create', () => {
    it('should create a profile with generated ID', async () => {
      const profile = await ProfileStorage.create({ name: 'Test Profile' });
      expect(profile.id).toBeDefined();
      expect(profile.name).toBe('Test Profile');
      expect(profile.isActive).toBe(true);
    });

    it('should set first profile as active', async () => {
      const first = await ProfileStorage.create({ name: 'First' });
      const second = await ProfileStorage.create({ name: 'Second' });
      expect(first.isActive).toBe(true);
      expect(second.isActive).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return empty array initially', async () => {
      const profiles = await ProfileStorage.getAll();
      expect(profiles).toEqual([]);
    });

    it('should return all created profiles', async () => {
      await ProfileStorage.create({ name: 'One' });
      await ProfileStorage.create({ name: 'Two' });
      const profiles = await ProfileStorage.getAll();
      expect(profiles).toHaveLength(2);
    });
  });

  describe('getById', () => {
    it('should find profile by ID', async () => {
      const created = await ProfileStorage.create({ name: 'Find Me' });
      const found = await ProfileStorage.getById(created.id);
      expect(found?.name).toBe('Find Me');
    });

    it('should return null if not found', async () => {
      const found = await ProfileStorage.getById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update profile fields', async () => {
      const profile = await ProfileStorage.create({ name: 'Original' });
      const updated = await ProfileStorage.update(profile.id, { name: 'Updated' });
      expect(updated?.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should remove profile', async () => {
      const profile = await ProfileStorage.create({ name: 'Delete Me' });
      await ProfileStorage.delete(profile.id);
      const profiles = await ProfileStorage.getAll();
      expect(profiles).toHaveLength(0);
    });
  });

  describe('setActive', () => {
    it('should change active profile', async () => {
      await ProfileStorage.create({ name: 'First' });
      const second = await ProfileStorage.create({ name: 'Second' });
      
      await ProfileStorage.setActive(second.id);
      
      const active = await ProfileStorage.getActive();
      expect(active?.id).toBe(second.id);
    });
  });

  describe('export/import', () => {
    it('should export and import profile', async () => {
      const original = await ProfileStorage.create({ name: 'Export Me' });
      const json = await ProfileStorage.export(original.id);
      
      await ProfileStorage.clearAll();
      
      const imported = await ProfileStorage.import(json!);
      expect(imported.name).toBe('Export Me (Imported)');
    });
  });
});
