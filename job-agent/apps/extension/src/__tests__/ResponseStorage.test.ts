/**
 * ResponseStorage Unit Tests
 * STORAGE-004: Test suite for saved responses (AI learning)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResponseStorage } from '../shared/storage/ResponseStorage';
import { 
  detectCategory, 
  extractKeywords, 
  normalizeQuestion,
  calculateSimilarity 
} from '../shared/types/response';

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

vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
});

describe('ResponseStorage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  describe('save', () => {
    it('should save a new response', async () => {
      const saved = await ResponseStorage.save(
        'Tell me about yourself',
        'I am a software engineer with 5 years of experience...'
      );

      expect(saved.id).toBeDefined();
      expect(saved.question).toBe('Tell me about yourself');
      expect(saved.timesUsed).toBe(1);
      expect(saved.keywords.length).toBeGreaterThan(0);
    });

    it('should auto-detect category', async () => {
      const saved = await ResponseStorage.save(
        'What is your salary expectation?',
        '$150,000 per year'
      );

      expect(saved.category).toBe('salary');
    });

    it('should use provided category', async () => {
      const saved = await ResponseStorage.save(
        'Random question',
        'Answer',
        { category: 'custom' }
      );

      expect(saved.category).toBe('custom');
    });
  });

  describe('findSimilar', () => {
    beforeEach(async () => {
      await ResponseStorage.save(
        'Tell me about your experience with React',
        'I have 3 years of React experience...'
      );
      await ResponseStorage.save(
        'What is your experience with TypeScript?',
        'I have been using TypeScript for 2 years...'
      );
      await ResponseStorage.save(
        'Why do you want this job?',
        'I am passionate about the company mission...'
      );
    });

    it('should find similar questions', async () => {
      const matches = await ResponseStorage.findSimilar(
        'Describe your React experience'
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].response.question).toContain('React');
    });

    it('should respect minScore', async () => {
      const matches = await ResponseStorage.findSimilar(
        'Completely unrelated question about cooking',
        { minScore: 0.5 }
      );

      expect(matches.length).toBe(0);
    });

    it('should limit results', async () => {
      const matches = await ResponseStorage.findSimilar(
        'experience',
        { maxResults: 1 }
      );

      expect(matches.length).toBeLessThanOrEqual(1);
    });
  });

  describe('findBestMatch', () => {
    it('should return best match', async () => {
      await ResponseStorage.save(
        'Tell me about yourself',
        'I am a developer...'
      );

      const match = await ResponseStorage.findBestMatch('Tell me about yourself');

      expect(match).not.toBeNull();
      expect(match?.score).toBeGreaterThan(0.5);
    });

    it('should return null for no match', async () => {
      const match = await ResponseStorage.findBestMatch('xyz123 random');
      expect(match).toBeNull();
    });
  });

  describe('update', () => {
    it('should update response', async () => {
      const saved = await ResponseStorage.save('Q', 'A');
      const updated = await ResponseStorage.update(saved.id, {
        response: 'Better answer',
      });

      expect(updated?.response).toBe('Better answer');
      expect(updated?.source).toBe('edited');
    });

    it('should re-extract keywords on question change', async () => {
      const saved = await ResponseStorage.save('Original question', 'Answer');
      const originalKeywords = [...saved.keywords];

      await ResponseStorage.update(saved.id, {
        question: 'Completely different question about programming',
      });

      const updated = await ResponseStorage.getById(saved.id);
      expect(updated?.keywords).not.toEqual(originalKeywords);
    });
  });

  describe('recordUsage', () => {
    it('should increment usage count', async () => {
      const saved = await ResponseStorage.save('Q', 'A');
      expect(saved.timesUsed).toBe(1);

      await ResponseStorage.recordUsage(saved.id);
      await ResponseStorage.recordUsage(saved.id);

      const updated = await ResponseStorage.getById(saved.id);
      expect(updated?.timesUsed).toBe(3);
    });
  });

  describe('rate', () => {
    it('should rate response', async () => {
      const saved = await ResponseStorage.save('Q', 'A');
      await ResponseStorage.rate(saved.id, 5);

      const updated = await ResponseStorage.getById(saved.id);
      expect(updated?.rating).toBe(5);
    });

    it('should clamp rating to 1-5', async () => {
      const saved = await ResponseStorage.save('Q', 'A');
      
      await ResponseStorage.rate(saved.id, 10);
      let updated = await ResponseStorage.getById(saved.id);
      expect(updated?.rating).toBe(5);

      await ResponseStorage.rate(saved.id, -1);
      updated = await ResponseStorage.getById(saved.id);
      expect(updated?.rating).toBe(1);
    });
  });

  describe('filtering', () => {
    beforeEach(async () => {
      await ResponseStorage.save('Q1', 'A1', { category: 'skills', profileId: 'p1' });
      await ResponseStorage.save('Q2', 'A2', { category: 'experience', profileId: 'p1' });
      await ResponseStorage.save('Q3', 'A3', { category: 'skills', profileId: 'p2' });
    });

    it('should filter by category', async () => {
      const filtered = await ResponseStorage.getFiltered({ category: 'skills' });
      expect(filtered).toHaveLength(2);
    });

    it('should filter by profile', async () => {
      const filtered = await ResponseStorage.getFiltered({ profileId: 'p1' });
      expect(filtered).toHaveLength(2);
    });

    it('should combine filters', async () => {
      const filtered = await ResponseStorage.getFiltered({ 
        category: 'skills', 
        profileId: 'p1' 
      });
      expect(filtered).toHaveLength(1);
    });
  });

  describe('import/export', () => {
    it('should export responses', async () => {
      await ResponseStorage.save('Q', 'A');
      const exported = await ResponseStorage.export();
      const parsed = JSON.parse(exported);

      expect(parsed.version).toBe('1.0');
      expect(parsed.responses).toHaveLength(1);
    });

    it('should import responses', async () => {
      const importData = JSON.stringify({
        responses: [
          { question: 'Imported Q1', response: 'Imported A1' },
          { question: 'Imported Q2', response: 'Imported A2' },
        ],
      });

      const result = await ResponseStorage.import(importData);

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);

      const all = await ResponseStorage.getAll();
      expect(all).toHaveLength(2);
    });

    it('should skip duplicates on merge import', async () => {
      await ResponseStorage.save('Existing question', 'Existing answer');

      const importData = JSON.stringify({
        responses: [
          { question: 'Existing question', response: 'New answer' },
          { question: 'New question', response: 'New answer' },
        ],
      });

      const result = await ResponseStorage.import(importData, { merge: true });

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete response', async () => {
      const saved = await ResponseStorage.save('Q', 'A');
      const deleted = await ResponseStorage.delete(saved.id);

      expect(deleted).toBe(true);

      const all = await ResponseStorage.getAll();
      expect(all).toHaveLength(0);
    });

    it('should delete by profile', async () => {
      await ResponseStorage.save('Q1', 'A1', { profileId: 'p1' });
      await ResponseStorage.save('Q2', 'A2', { profileId: 'p1' });
      await ResponseStorage.save('Q3', 'A3', { profileId: 'p2' });

      const deleted = await ResponseStorage.deleteByProfile('p1');

      expect(deleted).toBe(2);

      const all = await ResponseStorage.getAll();
      expect(all).toHaveLength(1);
    });
  });
});

describe('Response Utility Functions', () => {
  describe('detectCategory', () => {
    it('should detect personal category', () => {
      expect(detectCategory('Tell me about yourself')).toBe('personal');
    });

    it('should detect salary category', () => {
      expect(detectCategory('What are your salary expectations?')).toBe('salary');
    });

    it('should detect experience category', () => {
      expect(detectCategory('Describe your previous work experience')).toBe('experience');
    });

    it('should return other for unknown', () => {
      expect(detectCategory('xyz123')).toBe('other');
    });
  });

  describe('extractKeywords', () => {
    it('should extract meaningful keywords', () => {
      const keywords = extractKeywords('Tell me about your experience with React and TypeScript');
      
      expect(keywords).toContain('experience');
      expect(keywords).toContain('react');
      expect(keywords).toContain('typescript');
      expect(keywords).not.toContain('me');
      expect(keywords).not.toContain('with');
    });

    it('should handle empty string', () => {
      const keywords = extractKeywords('');
      expect(keywords).toEqual([]);
    });
  });

  describe('normalizeQuestion', () => {
    it('should normalize questions', () => {
      const q1 = normalizeQuestion('Tell me about yourself!');
      const q2 = normalizeQuestion('tell me about yourself');
      const q3 = normalizeQuestion('TELL ME ABOUT YOURSELF?');

      expect(q1).toBe(q2);
      expect(q2).toBe(q3);
    });
  });

  describe('calculateSimilarity', () => {
    it('should return high score for similar questions', () => {
      const score = calculateSimilarity(
        'Tell me about your React experience',
        'Describe your experience with React'
      );

      expect(score).toBeGreaterThan(0.3);
    });

    it('should return low score for different questions', () => {
      const score = calculateSimilarity(
        'What is your favorite color?',
        'Explain quantum physics'
      );

      expect(score).toBeLessThan(0.3);
    });
  });
});
