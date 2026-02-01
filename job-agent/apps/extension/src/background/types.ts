/**
 * Background Service Types
 * Message types for communication between extension components
 */

export type MessageType =
  | 'GET_PROFILES'
  | 'GET_ACTIVE_PROFILE'
  | 'SET_ACTIVE_PROFILE'
  | 'CREATE_PROFILE'
  | 'UPDATE_PROFILE'
  | 'DELETE_PROFILE'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'GET_LLM_CONFIG'
  | 'SET_LLM_PROVIDER'
  | 'GET_JOBS'
  | 'ADD_JOB'
  | 'MARK_JOB_APPLIED'
  | 'IS_URL_APPLIED'
  | 'GET_JOB_STATS'
  | 'SAVE_RESPONSE'
  | 'FIND_SIMILAR_RESPONSES'
  | 'GET_BEST_RESPONSE'
  | 'LLM_GENERATE'
  | 'LLM_CHECK_CONNECTION'
  | 'LLM_GENERATE_FORM_RESPONSE'
  | 'LLM_MATCH_FIELD'
  | 'LLM_SUMMARIZE_JOB'
  | 'UPDATE_BADGE'
  | 'GET_TODAY_COUNT'
  | 'CONTENT_READY'
  | 'FORM_DETECTED'
  | 'FILL_FORM'
  | 'FORM_FILLED';

export interface BaseMessage {
  type: MessageType;
  payload?: unknown;
}

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GetProfilesMessage extends BaseMessage {
  type: 'GET_PROFILES';
}

export interface GetActiveProfileMessage extends BaseMessage {
  type: 'GET_ACTIVE_PROFILE';
}

export interface SetActiveProfileMessage extends BaseMessage {
  type: 'SET_ACTIVE_PROFILE';
  payload: { profileId: string };
}

export interface CreateProfileMessage extends BaseMessage {
  type: 'CREATE_PROFILE';
  payload: { profile: Partial<import('../shared/types/profile').UserProfile> };
}

export interface UpdateProfileMessage extends BaseMessage {
  type: 'UPDATE_PROFILE';
  payload: { profileId: string; updates: Partial<import('../shared/types/profile').UserProfile> };
}

export interface DeleteProfileMessage extends BaseMessage {
  type: 'DELETE_PROFILE';
  payload: { profileId: string };
}

export interface GetSettingsMessage extends BaseMessage {
  type: 'GET_SETTINGS';
}

export interface UpdateSettingsMessage extends BaseMessage {
  type: 'UPDATE_SETTINGS';
  payload: { updates: Partial<import('../shared/types/settings').UserSettings> };
}

export interface SetLLMProviderMessage extends BaseMessage {
  type: 'SET_LLM_PROVIDER';
  payload: {
    provider: import('../shared/llm').LLMProvider;
    endpoint?: string;
    apiKey?: string;
    model?: string;
  };
}

export interface MarkJobAppliedMessage extends BaseMessage {
  type: 'MARK_JOB_APPLIED';
  payload: { profileId: string; url: string; title: string; company: string; notes?: string };
}

export interface IsUrlAppliedMessage extends BaseMessage {
  type: 'IS_URL_APPLIED';
  payload: { url: string; profileId?: string };
}

export interface SaveResponseMessage extends BaseMessage {
  type: 'SAVE_RESPONSE';
  payload: {
    question: string;
    answer: string;
    category?: import('../shared/types/response').ResponseCategory;
    profileId?: string;
    fieldType?: string;
  };
}

export interface FindSimilarResponsesMessage extends BaseMessage {
  type: 'FIND_SIMILAR_RESPONSES';
  payload: { question: string; threshold?: number; limit?: number };
}

export interface LLMGenerateMessage extends BaseMessage {
  type: 'LLM_GENERATE';
  payload: { prompt: string; systemPrompt?: string; maxTokens?: number; temperature?: number };
}

export interface LLMGenerateFormResponseMessage extends BaseMessage {
  type: 'LLM_GENERATE_FORM_RESPONSE';
  payload: { question: string; profileContext: string; fieldType?: string };
}

export interface LLMMatchFieldMessage extends BaseMessage {
  type: 'LLM_MATCH_FIELD';
  payload: { fieldLabel: string; fieldType: string; profileKeys: string[] };
}

export interface FormDetectedMessage extends BaseMessage {
  type: 'FORM_DETECTED';
  payload: {
    url: string;
    platform: string;
    fieldCount: number;
    fields: Array<{ name: string; type: string; label?: string; required?: boolean }>;
  };
}

export interface FillFormMessage extends BaseMessage {
  type: 'FILL_FORM';
  payload: { profileId: string; fields: Array<{ selector: string; value: string }> };
}

export type ExtensionMessage =
  | GetProfilesMessage
  | GetActiveProfileMessage
  | SetActiveProfileMessage
  | CreateProfileMessage
  | UpdateProfileMessage
  | DeleteProfileMessage
  | GetSettingsMessage
  | UpdateSettingsMessage
  | SetLLMProviderMessage
  | MarkJobAppliedMessage
  | IsUrlAppliedMessage
  | SaveResponseMessage
  | FindSimilarResponsesMessage
  | LLMGenerateMessage
  | LLMGenerateFormResponseMessage
  | LLMMatchFieldMessage
  | FormDetectedMessage
  | FillFormMessage
  | BaseMessage;
