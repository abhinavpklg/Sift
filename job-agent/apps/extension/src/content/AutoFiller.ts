/**
 * AutoFiller - Fills form fields with profile data
 */

import type { 
  DetectedField, 
  DetectedForm, 
  FieldFillResult, 
  FormFillResult,
  FieldType 
} from './types';
import type { UserProfile } from '../shared/types/profile';

interface FillOptions {
  delayBetweenFields?: number;
  skipFilled?: boolean;
  onlyRequired?: boolean;
  simulateTyping?: boolean;
  typingSpeed?: number;
}

const DEFAULT_OPTIONS: FillOptions = {
  delayBetweenFields: 100,
  skipFilled: true,
  onlyRequired: false,
  simulateTyping: false,
  typingSpeed: 30,
};

function getValueFromProfile(profile: UserProfile, profileKey: string): string | null {
  const keys = profileKey.split('.');
  let value: unknown = profile;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }

  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  
  return null;
}

function getFullName(profile: UserProfile): string {
  const first = profile.personalInfo?.firstName || '';
  const last = profile.personalInfo?.lastName || '';
  return `${first} ${last}`.trim();
}

function getProfileValue(profile: UserProfile, profileKey: string): string | null {
  // Special case: fullName
  if (profileKey === 'personalInfo.fullName') {
    const fullName = getValueFromProfile(profile, profileKey);
    if (fullName) return fullName;
    return getFullName(profile);
  }

  // Special case: location - try location field or address
  if (profileKey === 'personalInfo.location') {
    const location = getValueFromProfile(profile, profileKey);
    if (location) return location;
    // Try address as fallback
    const address = getValueFromProfile(profile, 'personalInfo.address');
    if (address) return address;
    return null;
  }

  return getValueFromProfile(profile, profileKey);
}

export class AutoFiller {
  private form: DetectedForm;
  private profile: UserProfile;
  private options: FillOptions;
  private results: FieldFillResult[] = [];

  constructor(form: DetectedForm, profile: UserProfile, options: Partial<FillOptions> = {}) {
    this.form = form;
    this.profile = profile;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async fillAll(): Promise<FormFillResult> {
    const startTime = Date.now();
    this.results = [];

    const fieldsToFill = this.getFieldsToFill();
    console.log(`[Sift] Filling ${fieldsToFill.length} fields...`);

    for (const field of fieldsToFill) {
      const result = await this.fillField(field);
      this.results.push(result);

      if (this.options.delayBetweenFields && this.options.delayBetweenFields > 0) {
        await this.delay(this.options.delayBetweenFields);
      }
    }

    const formResult = this.buildResult(startTime);
    console.log(`[Sift] Fill complete:`, {
      filled: formResult.filledFields,
      skipped: formResult.skippedFields,
      errors: formResult.errorFields,
      duration: formResult.duration + 'ms',
    });

    return formResult;
  }

  async fillField(field: DetectedField): Promise<FieldFillResult> {
    const profileKey = (field as DetectedField & { profileKey?: string }).profileKey;
    
    if (!profileKey) {
      return { fieldId: field.id, success: false, error: 'No profile key mapped' };
    }

    const value = getProfileValue(this.profile, profileKey);
    
    if (value === null || value === undefined) {
      return { fieldId: field.id, success: false, error: `No value for ${profileKey}` };
    }

    try {
      const element = document.querySelector(field.selector);
      if (!element) {
        return { fieldId: field.id, success: false, error: 'Element not found' };
      }

      const previousValue = field.value;
      await this.setFieldValue(element as HTMLElement, field.type, value);

      return { fieldId: field.id, success: true, previousValue, newValue: value };
    } catch (error) {
      return { fieldId: field.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async setFieldValue(element: HTMLElement, type: FieldType, value: string): Promise<void> {
    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
        await this.setInputValue(element as HTMLInputElement, value);
        break;
      case 'textarea':
        await this.setTextareaValue(element as HTMLTextAreaElement, value);
        break;
      case 'select':
        await this.setSelectValue(element as HTMLSelectElement, value);
        break;
      case 'checkbox':
        this.setCheckboxValue(element as HTMLInputElement, value);
        break;
      case 'radio':
        this.setRadioValue(element as HTMLInputElement, value);
        break;
      case 'date':
        this.setDateValue(element as HTMLInputElement, value);
        break;
      case 'file':
        console.log('[Sift] Skipping file input (security restriction)');
        break;
      default:
        await this.setInputValue(element as HTMLInputElement, value);
    }
  }

  private async setInputValue(input: HTMLInputElement, value: string): Promise<void> {
    input.focus();
    this.triggerEvent(input, 'focus');

    if (this.options.simulateTyping) {
      await this.simulateTyping(input, value);
    } else {
      input.value = '';
      this.triggerEvent(input, 'input');
      input.value = value;
      this.triggerEvent(input, 'input');
    }

    this.triggerEvent(input, 'change');
    input.blur();
    this.triggerEvent(input, 'blur');
  }

  private async setTextareaValue(textarea: HTMLTextAreaElement, value: string): Promise<void> {
    textarea.focus();
    this.triggerEvent(textarea, 'focus');

    if (this.options.simulateTyping) {
      await this.simulateTyping(textarea, value);
    } else {
      textarea.value = value;
      this.triggerEvent(textarea, 'input');
    }

    this.triggerEvent(textarea, 'change');
    textarea.blur();
    this.triggerEvent(textarea, 'blur');
  }

  private async setSelectValue(select: HTMLSelectElement, value: string): Promise<void> {
    select.focus();
    this.triggerEvent(select, 'focus');

    const options = Array.from(select.options);
    const matchingOption = options.find(opt => 
      opt.value.toLowerCase() === value.toLowerCase() ||
      opt.text.toLowerCase() === value.toLowerCase() ||
      opt.text.toLowerCase().includes(value.toLowerCase()) ||
      value.toLowerCase().includes(opt.text.toLowerCase())
    );

    if (matchingOption) {
      select.value = matchingOption.value;
    } else {
      const partialMatch = options.find(opt => 
        opt.text.toLowerCase().includes(value.substring(0, 3).toLowerCase())
      );
      if (partialMatch) select.value = partialMatch.value;
    }

    this.triggerEvent(select, 'change');
    select.blur();
    this.triggerEvent(select, 'blur');
  }

  private setCheckboxValue(checkbox: HTMLInputElement, value: string): void {
    const shouldCheck = ['yes', 'true', '1', 'checked', 'on'].includes(value.toLowerCase());
    if (checkbox.checked !== shouldCheck) {
      checkbox.checked = shouldCheck;
      this.triggerEvent(checkbox, 'click');
      this.triggerEvent(checkbox, 'change');
    }
  }

  private setRadioValue(radio: HTMLInputElement, value: string): void {
    const name = radio.name;
    if (!name) return;

    const radios = document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`);
    
    for (const r of radios) {
      const label = document.querySelector(`label[for="${r.id}"]`);
      const labelText = label?.textContent?.toLowerCase() || '';
      const radioValue = r.value.toLowerCase();

      if (radioValue === value.toLowerCase() || 
          labelText.includes(value.toLowerCase()) ||
          value.toLowerCase().includes(radioValue)) {
        r.checked = true;
        this.triggerEvent(r, 'click');
        this.triggerEvent(r, 'change');
        break;
      }
    }
  }

  private setDateValue(input: HTMLInputElement, value: string): void {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      input.value = date.toISOString().split('T')[0];
    } else {
      input.value = value;
    }
    this.triggerEvent(input, 'input');
    this.triggerEvent(input, 'change');
  }

  private triggerEvent(element: HTMLElement, eventType: string): void {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);

    if (eventType === 'input' && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        element instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype,
        'value'
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, element.value);
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
      }
    }

    const reactEvent = new Event(eventType, { bubbles: true });
    Object.defineProperty(reactEvent, 'target', { value: element, writable: false });
    element.dispatchEvent(reactEvent);
  }

  private async simulateTyping(element: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<void> {
    element.value = '';
    for (const char of value) {
      element.value += char;
      this.triggerEvent(element, 'input');
      const keyEvent = new KeyboardEvent('keydown', { key: char, bubbles: true });
      element.dispatchEvent(keyEvent);
      await this.delay(this.options.typingSpeed || 30);
    }
  }

  private getFieldsToFill(): DetectedField[] {
    let fields = this.form.fields;
    if (this.options.skipFilled) {
      fields = fields.filter(f => !f.value || f.value.trim() === '');
    }
    if (this.options.onlyRequired) {
      fields = fields.filter(f => f.required);
    }
    fields = fields.filter(f => f.type !== 'file');
    fields = fields.sort((a, b) => {
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      return 0;
    });
    return fields;
  }

  private buildResult(startTime: number): FormFillResult {
    const filled = this.results.filter(r => r.success).length;
    const errors = this.results.filter(r => !r.success && r.error !== 'No profile key mapped').length;
    const skipped = this.results.filter(r => !r.success && r.error === 'No profile key mapped').length;

    return {
      formId: this.form.id,
      totalFields: this.form.fields.length,
      filledFields: filled,
      skippedFields: skipped,
      errorFields: errors,
      results: this.results,
      duration: Date.now() - startTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getResults(): FieldFillResult[] { return this.results; }
  getFilledCount(): number { return this.results.filter(r => r.success).length; }
  getErrorCount(): number { return this.results.filter(r => !r.success).length; }
}

export default AutoFiller;
