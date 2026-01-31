/**
 * ResponseStorage - Chrome Storage API wrapper for saved responses
 * STORAGE-004: AI learning from user inputs
 */

import type { 
  SavedResponse, 
  ResponseCategory, 
  ResponseSource,
  ResponseFilter,
  ResponseMatch
} from '../types/response';
import { 
  detectCategory, 
  extractKeywords, 
  normalizeQuestion,
  calculateSimilarity
} from '../types/response';

const STORAGE_KEY = 'sift_saved_responses';

export interface ResponseStorageEvents {
  onResponsesChanged?: (responses: SavedResponse[]) => void;
}

/**
 * ResponseStorage Class
 * Manages saved question-response pairs for AI learning
 */
export class ResponseStorage {
  private static listeners: ResponseStorageEvents = {};
  private static initialized = false;

  /**
   * Initialize with change listeners
   */
  static init(events?: ResponseStorageEvents): void {
    if (this.initialized) return;

    if (events) {
      this.listeners = events;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      if (changes[STORAGE_KEY]) {
        const responses = (changes[STORAGE_KEY].newValue as SavedResponse[]) || [];
        this.listeners.onResponsesChanged?.(responses);
      }
    });

    this.initialized = true;
  }

  // ============================================
  // READ Operations
  // ============================================

  /**
   * Get all saved responses
   */
  static async getAll(): Promise<SavedResponse[]> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as SavedResponse[]) || [];
  }

  /**
   * Get response by ID
   */
  static async getById(responseId: string): Promise<SavedResponse | null> {
    const responses = await this.getAll();
    return responses.find(r => r.id === responseId) || null;
  }

  /**
   * Get responses by category
   */
  static async getByCategory(category: ResponseCategory): Promise<SavedResponse[]> {
    const responses = await this.getAll();
    return responses.filter(r => r.category === category);
  }

  /**
   * Get responses by profile
   */
  static async getByProfile(profileId: string): Promise<SavedResponse[]> {
    const responses = await this.getAll();
    return responses.filter(r => r.profileId === profileId || !r.profileId);
  }

  /**
   * Get filtered responses
   */
  static async getFiltered(filter: ResponseFilter): Promise<SavedResponse[]> {
    let responses = await this.getAll();

    if (filter.category) {
      const categories = Array.isArray(filter.category) 
        ? filter.category 
        : [filter.category];
      responses = responses.filter(r => categories.includes(r.category));
    }

    if (filter.profileId) {
      responses = responses.filter(r => 
        r.profileId === filter.profileId || !r.profileId
      );
    }

    if (filter.keywords && filter.keywords.length > 0) {
      const filterKeywords = filter.keywords.map(k => k.toLowerCase());
      responses = responses.filter(r =>
        r.keywords.some(k => filterKeywords.includes(k.toLowerCase()))
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      responses = responses.filter(r =>
        r.question.toLowerCase().includes(query) ||
        r.response.toLowerCase().includes(query) ||
        r.keywords.some(k => k.toLowerCase().includes(query))
      );
    }

    if (filter.minTimesUsed !== undefined) {
      responses = responses.filter(r => r.timesUsed >= filter.minTimesUsed!);
    }

    if (filter.minRating !== undefined) {
      responses = responses.filter(r => 
        r.rating !== undefined && r.rating >= filter.minRating!
      );
    }

    return responses;
  }

  /**
   * Find similar responses to a question
   */
  static async findSimilar(
    question: string, 
    options: {
      minScore?: number;
      maxResults?: number;
      profileId?: string;
      category?: ResponseCategory;
    } = {}
  ): Promise<ResponseMatch[]> {
    const { 
      minScore = 0.3, 
      maxResults = 5, 
      profileId,
      category 
    } = options;

    let responses = await this.getAll();

    // Filter by profile
    if (profileId) {
      responses = responses.filter(r => 
        r.profileId === profileId || !r.profileId
      );
    }

    // Filter by category if provided
    if (category) {
      responses = responses.filter(r => r.category === category);
    }

    const questionKeywords = extractKeywords(question);
    const matches: ResponseMatch[] = [];

    for (const response of responses) {
      const score = calculateSimilarity(question, response.question);
      
      if (score >= minScore) {
        const matchedKeywords = questionKeywords.filter(k => 
          response.keywords.includes(k)
        );
        
        matches.push({ response, score, matchedKeywords });
      }
    }

    // Sort by score descending, then by timesUsed
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.response.timesUsed - a.response.timesUsed;
    });

    return matches.slice(0, maxResults);
  }

  /**
   * Find best match for a question
   */
  static async findBestMatch(
    question: string,
    profileId?: string
  ): Promise<ResponseMatch | null> {
    const matches = await this.findSimilar(question, { 
      maxResults: 1, 
      profileId,
      minScore: 0.4 
    });
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Get most used responses
   */
  static async getMostUsed(limit: number = 10): Promise<SavedResponse[]> {
    const responses = await this.getAll();
    return responses
      .sort((a, b) => b.timesUsed - a.timesUsed)
      .slice(0, limit);
  }

  /**
   * Get recently used responses
   */
  static async getRecentlyUsed(limit: number = 10): Promise<SavedResponse[]> {
    const responses = await this.getAll();
    return responses
      .filter(r => r.lastUsed)
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, limit);
  }

  // ============================================
  // WRITE Operations
  // ============================================

  /**
   * Save a new response
   */
  static async save(
    question: string,
    response: string,
    options: {
      profileId?: string;
      category?: ResponseCategory;
      source?: ResponseSource;
      keywords?: string[];
    } = {}
  ): Promise<SavedResponse> {
    const responses = await this.getAll();
    const now = new Date().toISOString();

    // Auto-detect category if not provided
    const category = options.category || detectCategory(question);
    
    // Auto-extract keywords if not provided
    const keywords = options.keywords || extractKeywords(question + ' ' + response);

    const newResponse: SavedResponse = {
      id: crypto.randomUUID(),
      question,
      questionNormalized: normalizeQuestion(question),
      response,
      keywords,
      category,
      profileId: options.profileId,
      timesUsed: 1,
      lastUsed: now,
      createdAt: now,
      updatedAt: now,
      source: options.source || 'user_input',
    };

    responses.unshift(newResponse);
    await chrome.storage.local.set({ [STORAGE_KEY]: responses });

    return newResponse;
  }

  /**
   * Update an existing response
   */
  static async update(
    responseId: string,
    updates: Partial<Pick<SavedResponse, 'question' | 'response' | 'keywords' | 'category' | 'rating'>>
  ): Promise<SavedResponse | null> {
    const responses = await this.getAll();
    const index = responses.findIndex(r => r.id === responseId);

    if (index === -1) return null;

    const updated = {
      ...responses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      source: 'edited' as ResponseSource,
    };

    // Re-normalize if question changed
    if (updates.question) {
      updated.questionNormalized = normalizeQuestion(updates.question);
    }

    // Re-extract keywords if question or response changed
    if (updates.question || updates.response) {
      updated.keywords = extractKeywords(
        (updates.question || responses[index].question) + ' ' + 
        (updates.response || responses[index].response)
      );
    }

    responses[index] = updated;
    await chrome.storage.local.set({ [STORAGE_KEY]: responses });

    return updated;
  }

  /**
   * Record usage of a response
   */
  static async recordUsage(responseId: string): Promise<boolean> {
    const responses = await this.getAll();
    const index = responses.findIndex(r => r.id === responseId);

    if (index === -1) return false;

    responses[index].timesUsed++;
    responses[index].lastUsed = new Date().toISOString();

    await chrome.storage.local.set({ [STORAGE_KEY]: responses });
    return true;
  }

  /**
   * Rate a response
   */
  static async rate(responseId: string, rating: number): Promise<boolean> {
    const responses = await this.getAll();
    const index = responses.findIndex(r => r.id === responseId);

    if (index === -1) return false;

    responses[index].rating = Math.max(1, Math.min(5, rating));
    responses[index].updatedAt = new Date().toISOString();

    await chrome.storage.local.set({ [STORAGE_KEY]: responses });
    return true;
  }

  /**
   * Delete a response
   */
  static async delete(responseId: string): Promise<boolean> {
    const responses = await this.getAll();
    const filtered = responses.filter(r => r.id !== responseId);

    if (filtered.length === responses.length) return false;

    await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
    return true;
  }

  /**
   * Delete all responses for a profile
   */
  static async deleteByProfile(profileId: string): Promise<number> {
    const responses = await this.getAll();
    const filtered = responses.filter(r => r.profileId !== profileId);
    const deleted = responses.length - filtered.length;

    await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
    return deleted;
  }

  // ============================================
  // Import/Export
  // ============================================

  /**
   * Export all responses
   */
  static async export(): Promise<string> {
    const responses = await this.getAll();
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      responses,
    }, null, 2);
  }

  /**
   * Import responses
   */
  static async import(
    jsonString: string, 
    options: { 
      merge?: boolean; 
      profileId?: string 
    } = {}
  ): Promise<{ imported: number; skipped: number }> {
    const { merge = true, profileId } = options;

    let data: { responses: Partial<SavedResponse>[] };
    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (!Array.isArray(data.responses)) {
      throw new Error('Expected responses array');
    }

    const existing = merge ? await this.getAll() : [];
    const existingQuestions = new Set(
      existing.map(r => r.questionNormalized)
    );

    const now = new Date().toISOString();
    let imported = 0;
    let skipped = 0;

    for (const item of data.responses) {
      if (!item.question || !item.response) {
        skipped++;
        continue;
      }

      const normalized = normalizeQuestion(item.question);
      
      if (merge && existingQuestions.has(normalized)) {
        skipped++;
        continue;
      }

      existing.push({
        id: crypto.randomUUID(),
        question: item.question,
        questionNormalized: normalized,
        response: item.response,
        keywords: item.keywords || extractKeywords(item.question + ' ' + item.response),
        category: item.category || detectCategory(item.question),
        profileId: profileId || item.profileId,
        timesUsed: 0,
        lastUsed: now,
        createdAt: now,
        updatedAt: now,
        source: 'imported',
      });

      existingQuestions.add(normalized);
      imported++;
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: existing });
    return { imported, skipped };
  }

  /**
   * Clear all responses
   */
  static async clearAll(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEY);
  }

  /**
   * Get response count
   */
  static async getCount(): Promise<number> {
    const responses = await this.getAll();
    return responses.length;
  }

  /**
   * Get stats by category
   */
  static async getStatsByCategory(): Promise<Record<ResponseCategory, number>> {
    const responses = await this.getAll();
    const stats: Record<string, number> = {};

    for (const r of responses) {
      stats[r.category] = (stats[r.category] || 0) + 1;
    }

    return stats as Record<ResponseCategory, number>;
  }
}

export default ResponseStorage;
