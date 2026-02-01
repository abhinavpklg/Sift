/**
 * Content Script Types
 */

export type ATSPlatform =
  | 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'icims'
  | 'smartrecruiters' | 'jobvite' | 'bamboohr' | 'breezy' | 'workable' | 'unknown';

export interface PlatformInfo {
  platform: ATSPlatform;
  isApplicationPage: boolean;
  jobTitle?: string;
  company?: string;
  jobId?: string;
}

export type FieldType =
  | 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea'
  | 'select' | 'radio' | 'checkbox' | 'file' | 'date' | 'hidden' | 'unknown';

export interface DetectedField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  value?: string;
  selector: string;
  element: HTMLElement;
}

export interface DetectedForm {
  id: string;
  platform: ATSPlatform;
  url: string;
  fields: DetectedField[];
  submitButton?: HTMLElement;
  isMultiPage: boolean;
  currentPage?: number;
  totalPages?: number;
}

export interface FieldFillResult {
  fieldId: string;
  success: boolean;
  previousValue?: string;
  newValue?: string;
  error?: string;
}

export interface FormFillResult {
  formId: string;
  totalFields: number;
  filledFields: number;
  skippedFields: number;
  errorFields: number;
  results: FieldFillResult[];
  duration: number;
}

export interface ContentState {
  initialized: boolean;
  platform: ATSPlatform;
  isApplicationPage: boolean;
  currentForm: DetectedForm | null;
  isFillingForm: boolean;
  lastFillResult: FormFillResult | null;
}

export interface ContentEvents {
  onReady?: () => void;
  onFormDetected?: (form: DetectedForm) => void;
  onFormFilled?: (result: FormFillResult) => void;
  onError?: (error: Error) => void;
}
