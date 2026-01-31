/**
 * Message Types
 * Communication between extension components
 */

import type { UserProfile } from './profile';
import type { AppliedJob, ScrapedJob, JobStats } from './job';

// Message types enum for type safety
export type MessageType =
  // Profile messages
  | 'GET_ACTIVE_PROFILE'
  | 'SET_ACTIVE_PROFILE'
  | 'GET_ALL_PROFILES'
  
  // Form filling messages
  | 'FILL_FORM'
  | 'GENERATE_RESPONSE'
  
  // Job tracking messages
  | 'CHECK_URL'
  | 'MARK_APPLIED'
  | 'GET_STATS'
  | 'INCREMENT_COUNTER'
  
  // Scraping messages
  | 'START_SCRAPING'
  | 'STOP_SCRAPING'
  | 'GET_SCRAPING_STATUS'
  
  // LLM messages
  | 'LLM_GENERATE'
  | 'LLM_HEALTH_CHECK'
  
  // Utility messages
  | 'PING';

// Base message interface
export interface BaseMessage {
  type: MessageType;
}

// Specific message types
export interface GetActiveProfileMessage extends BaseMessage {
  type: 'GET_ACTIVE_PROFILE';
}

export interface SetActiveProfileMessage extends BaseMessage {
  type: 'SET_ACTIVE_PROFILE';
  profileId: string;
}

export interface FillFormMessage extends BaseMessage {
  type: 'FILL_FORM';
  options?: {
    autoSubmit?: boolean;
    skipFilled?: boolean;
  };
}

export interface GenerateResponseMessage extends BaseMessage {
  type: 'GENERATE_RESPONSE';
  question: string;
  context?: string;
}

export interface CheckUrlMessage extends BaseMessage {
  type: 'CHECK_URL';
  url: string;
}

export interface MarkAppliedMessage extends BaseMessage {
  type: 'MARK_APPLIED';
  job: Omit<AppliedJob, 'id'>;
}

export interface LLMGenerateMessage extends BaseMessage {
  type: 'LLM_GENERATE';
  prompt: string;
  systemPrompt?: string;
}

// Union type of all messages
export type ExtensionMessage =
  | GetActiveProfileMessage
  | SetActiveProfileMessage
  | FillFormMessage
  | GenerateResponseMessage
  | CheckUrlMessage
  | MarkAppliedMessage
  | LLMGenerateMessage
  | { type: 'GET_ALL_PROFILES' }
  | { type: 'GET_STATS' }
  | { type: 'INCREMENT_COUNTER' }
  | { type: 'START_SCRAPING' }
  | { type: 'STOP_SCRAPING' }
  | { type: 'GET_SCRAPING_STATUS' }
  | { type: 'LLM_HEALTH_CHECK' }
  | { type: 'PING' };

// Response types
export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Specific response types
export type ProfileResponse = MessageResponse<UserProfile | null>;
export type ProfilesResponse = MessageResponse<UserProfile[]>;
export type StatsResponse = MessageResponse<JobStats>;
export type AppliedJobResponse = MessageResponse<AppliedJob | null>;
export type LLMGenerateResponse = MessageResponse<{ text: string; tokensUsed: number }>;
export type HealthCheckResponse = MessageResponse<{ connected: boolean; model?: string }>;

// Helper type for message handlers
export type MessageHandler<M extends ExtensionMessage, R> = (
  message: M,
  sender: chrome.runtime.MessageSender
) => Promise<R>;
