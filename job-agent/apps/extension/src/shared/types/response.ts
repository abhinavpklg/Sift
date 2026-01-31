/**
 * Response Types for Sift Chrome Extension
 * STORAGE-004: Type definitions for saved responses (AI learning)
 */

export interface SavedResponse {
  id: string;
  question: string;
  questionNormalized: string;
  response: string;
  keywords: string[];
  category: ResponseCategory;
  profileId?: string;
  timesUsed: number;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
  source: ResponseSource;
  rating?: number;
}

export type ResponseCategory =
  | 'personal'
  | 'experience'
  | 'skills'
  | 'education'
  | 'motivation'
  | 'salary'
  | 'availability'
  | 'legal'
  | 'custom'
  | 'other';

export type ResponseSource =
  | 'user_input'
  | 'ai_generated'
  | 'imported'
  | 'edited';

export interface ResponseFilter {
  category?: ResponseCategory | ResponseCategory[];
  profileId?: string;
  keywords?: string[];
  searchQuery?: string;
  minTimesUsed?: number;
  minRating?: number;
}

export interface ResponseMatch {
  response: SavedResponse;
  score: number;
  matchedKeywords: string[];
}

/**
 * Common question patterns for categorization
 */
export const QUESTION_PATTERNS: Record<ResponseCategory, RegExp[]> = {
  personal: [
    /tell (me |us )?(about yourself|more about you)/i,
    /introduce yourself/i,
    /who are you/i,
    /describe yourself/i,
  ],
  experience: [
    /experience/i,
    /previous (job|role|position|work)/i,
    /background/i,
    /worked (on|with|at)/i,
    /accomplish/i,
    /achieve/i,
    /project/i,
    /challenge/i,
  ],
  skills: [
    /skill/i,
    /proficien/i,
    /familiar with/i,
    /knowledge of/i,
    /expertise/i,
    /technolog/i,
    /programming/i,
    /language/i,
    /framework/i,
    /tool/i,
  ],
  education: [
    /education/i,
    /degree/i,
    /university/i,
    /college/i,
    /certif/i,
    /graduate/i,
    /study/i,
    /major/i,
  ],
  motivation: [
    /why (do you want|are you interested|this (job|role|company|position))/i,
    /motivat/i,
    /passion/i,
    /interest/i,
    /excite/i,
    /career goal/i,
    /where do you see yourself/i,
  ],
  salary: [
    /salary/i,
    /compensation/i,
    /pay/i,
    /expectation/i,
    /rate/i,
    /money/i,
  ],
  availability: [
    /start date/i,
    /available/i,
    /when can you/i,
    /notice period/i,
    /relocat/i,
    /remote/i,
    /on-?site/i,
    /hybrid/i,
  ],
  legal: [
    /authorized/i,
    /sponsor/i,
    /visa/i,
    /legally/i,
    /background check/i,
    /drug test/i,
    /clearance/i,
  ],
  custom: [],
  other: [],
};

/**
 * Detect category from question text
 */
export function detectCategory(question: string): ResponseCategory {
  for (const [category, patterns] of Object.entries(QUESTION_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(question))) {
      return category as ResponseCategory;
    }
  }
  return 'other';
}

/**
 * Extract keywords from question
 */
export function extractKeywords(text: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
    'because', 'until', 'while', 'about', 'against', 'this', 'that', 'these',
    'those', 'what', 'which', 'who', 'whom', 'your', 'you', 'me', 'my', 'us',
    'our', 'tell', 'describe', 'explain', 'please', 'any', 'also',
  ]);

  // Extract words, filter stop words, get unique
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)];
}

/**
 * Normalize question for matching
 */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity score between two questions
 */
export function calculateSimilarity(q1: string, q2: string): number {
  const words1 = new Set(extractKeywords(q1));
  const words2 = new Set(extractKeywords(q2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity
  return intersection.size / union.size;
}
