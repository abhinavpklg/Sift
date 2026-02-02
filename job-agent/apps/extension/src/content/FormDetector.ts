/**
 * FormDetector - Detects and analyzes form fields on ATS pages
 * Extracts labels, types, requirements, and maps to profile fields
 */

import type { 
  ATSPlatform, 
  DetectedField, 
  DetectedForm, 
  FieldType 
} from './types';
import { getPlatformSelectors } from './platforms';

// ============================================
// Field Pattern Matching
// ============================================

interface FieldPattern {
  keywords: string[];
  profileKey: string;
  priority: number;
}

const FIELD_PATTERNS: FieldPattern[] = [
  // Personal Info
  { keywords: ['first name', 'firstname', 'given name', 'first_name'], profileKey: 'personalInfo.firstName', priority: 1 },
  { keywords: ['last name', 'lastname', 'surname', 'family name', 'last_name'], profileKey: 'personalInfo.lastName', priority: 1 },
  { keywords: ['full name', 'fullname', 'name', 'your name'], profileKey: 'personalInfo.fullName', priority: 2 },
  { keywords: ['email', 'e-mail', 'email address'], profileKey: 'personalInfo.email', priority: 1 },
  { keywords: ['phone', 'telephone', 'mobile', 'cell', 'phone number'], profileKey: 'personalInfo.phone', priority: 1 },
  
  // Location
  { keywords: ['city'], profileKey: 'personalInfo.city', priority: 1 },
  { keywords: ['state', 'province'], profileKey: 'personalInfo.state', priority: 1 },
  { keywords: ['country'], profileKey: 'personalInfo.country', priority: 1 },
  { keywords: ['zip', 'postal', 'postcode'], profileKey: 'personalInfo.zip', priority: 1 },
  { keywords: ['address', 'street'], profileKey: 'personalInfo.address', priority: 2 },
  { keywords: ['location'], profileKey: 'personalInfo.location', priority: 3 },
  
  // Links
  { keywords: ['linkedin', 'linkedin.com', 'linkedin url', 'linkedin profile'], profileKey: 'personalInfo.linkedIn', priority: 1 },
  { keywords: ['github', 'github.com', 'github url', 'github profile'], profileKey: 'personalInfo.github', priority: 1 },
  { keywords: ['portfolio', 'website', 'personal website', 'personal site'], profileKey: 'personalInfo.portfolio', priority: 1 },
  { keywords: ['twitter', 'x.com'], profileKey: 'personalInfo.twitter', priority: 2 },
  
  // Resume/Cover
  { keywords: ['resume', 'cv', 'curriculum vitae'], profileKey: 'documents.resume', priority: 1 },
  { keywords: ['cover letter', 'cover_letter', 'coverletter'], profileKey: 'documents.coverLetter', priority: 1 },
  
  // Work Authorization
  { keywords: ['authorized', 'work authorization', 'legally authorized', 'right to work'], profileKey: 'workAuth.authorized', priority: 1 },
  { keywords: ['sponsorship', 'visa sponsorship', 'require sponsorship', 'need sponsorship'], profileKey: 'workAuth.sponsorship', priority: 1 },
  { keywords: ['visa status', 'work visa'], profileKey: 'workAuth.visaStatus', priority: 2 },
  
  // Experience
  { keywords: ['years of experience', 'years experience', 'experience years', 'how many years'], profileKey: 'experience.years', priority: 1 },
  { keywords: ['current company', 'current employer'], profileKey: 'experience.currentCompany', priority: 1 },
  { keywords: ['current title', 'current role', 'current position', 'job title'], profileKey: 'experience.currentTitle', priority: 1 },
  
  // Education
  { keywords: ['degree', 'highest degree', 'education level'], profileKey: 'education.degree', priority: 1 },
  { keywords: ['university', 'college', 'school', 'institution'], profileKey: 'education.school', priority: 1 },
  { keywords: ['major', 'field of study', 'concentration'], profileKey: 'education.major', priority: 1 },
  { keywords: ['graduation', 'grad year', 'graduation year'], profileKey: 'education.graduationYear', priority: 1 },
  { keywords: ['gpa', 'grade point'], profileKey: 'education.gpa', priority: 2 },
  
  // Salary
  { keywords: ['salary', 'compensation', 'expected salary', 'desired salary'], profileKey: 'preferences.salary', priority: 1 },
  { keywords: ['start date', 'available', 'availability', 'when can you start'], profileKey: 'preferences.startDate', priority: 1 },
  
  // Demographics (optional)
  { keywords: ['gender', 'sex'], profileKey: 'demographics.gender', priority: 3 },
  { keywords: ['race', 'ethnicity'], profileKey: 'demographics.ethnicity', priority: 3 },
  { keywords: ['veteran', 'military'], profileKey: 'demographics.veteran', priority: 3 },
  { keywords: ['disability', 'disabled'], profileKey: 'demographics.disability', priority: 3 },
  
  // Open-ended
  { keywords: ['why do you want', 'why are you interested', 'interest in'], profileKey: 'responses.whyInterested', priority: 2 },
  { keywords: ['tell us about yourself', 'about yourself', 'introduce yourself'], profileKey: 'responses.aboutYourself', priority: 2 },
  { keywords: ['additional information', 'anything else', 'other information'], profileKey: 'responses.additionalInfo', priority: 3 },
];

// ============================================
// FormDetector Class
// ============================================

export class FormDetector {
  private platform: ATSPlatform;
  private form: HTMLFormElement | null = null;
  private fields: DetectedField[] = [];

  constructor(platform: ATSPlatform) {
    this.platform = platform;
  }

  // ============================================
  // Main Detection
  // ============================================

  detect(): DetectedForm | null {
    this.form = this.findForm();
    if (!this.form) {
      console.log('[Sift] No form found');
      return null;
    }

    this.fields = this.detectFields();
    
    const detectedForm: DetectedForm = {
      id: this.generateFormId(),
      platform: this.platform,
      url: window.location.href,
      fields: this.fields,
      submitButton: this.findSubmitButton(),
      isMultiPage: this.detectMultiPage(),
      currentPage: this.getCurrentPage(),
      totalPages: this.getTotalPages(),
    };

    console.log(`[Sift] Detected ${this.fields.length} fields`);
    return detectedForm;
  }

  // ============================================
  // Form Finding
  // ============================================

  private findForm(): HTMLFormElement | null {
    // Try platform-specific selectors first
    const selectors = getPlatformSelectors(this.platform);
    if (selectors?.applicationForm) {
      for (const selector of selectors.applicationForm.split(', ')) {
        const form = document.querySelector<HTMLFormElement>(selector);
        if (form) return form;
      }
    }

    // Generic selectors
    const genericSelectors = [
      'form[data-controller="application"]',
      'form.application-form',
      'form[action*="apply"]',
      'form[action*="application"]',
      'form[id*="application"]',
      'form[class*="application"]',
      'main form',
      'form',
    ];

    for (const selector of genericSelectors) {
      const form = document.querySelector<HTMLFormElement>(selector);
      if (form && this.isApplicationForm(form)) return form;
    }

    return null;
  }

  private isApplicationForm(form: HTMLFormElement): boolean {
    const inputs = form.querySelectorAll('input, textarea, select');
    if (inputs.length < 3) return false;

    const html = form.innerHTML.toLowerCase();
    const indicators = ['name', 'email', 'phone', 'resume', 'cover', 'linkedin', 'experience'];
    const matches = indicators.filter(i => html.includes(i)).length;
    return matches >= 2;
  }

  // ============================================
  // Field Detection
  // ============================================

  private detectFields(): DetectedField[] {
    if (!this.form) return [];

    const fields: DetectedField[] = [];
    const elements = this.form.querySelectorAll('input, textarea, select');

    elements.forEach((el, index) => {
      const field = this.analyzeField(el as HTMLElement, index);
      if (field) fields.push(field);
    });

    return fields;
  }

  private analyzeField(element: HTMLElement, index: number): DetectedField | null {
    // Skip hidden, submit, button types
    if (element instanceof HTMLInputElement) {
      if (['hidden', 'submit', 'button', 'reset', 'image'].includes(element.type)) {
        return null;
      }
    }

    const type = this.getFieldType(element);
    const label = this.getFieldLabel(element);
    const name = this.getFieldName(element);
    
    // Skip fields without identifiable info
    if (!label && !name) return null;

    const field: DetectedField = {
      id: `field-${index}-${Date.now()}`,
      name,
      type,
      label,
      placeholder: this.getPlaceholder(element),
      required: this.isRequired(element),
      options: this.getOptions(element),
      value: this.getValue(element),
      selector: this.generateSelector(element),
      element,
    };

    // Match to profile key
    const profileKey = this.matchToProfile(field);
    if (profileKey) {
      (field as DetectedField & { profileKey: string }).profileKey = profileKey;
    }

    return field;
  }

  // ============================================
  // Field Analysis Helpers
  // ============================================

  private getFieldType(element: HTMLElement): FieldType {
    if (element instanceof HTMLSelectElement) return 'select';
    if (element instanceof HTMLTextAreaElement) return 'textarea';
    if (element instanceof HTMLInputElement) {
      const typeMap: Record<string, FieldType> = {
        text: 'text',
        email: 'email',
        tel: 'tel',
        url: 'url',
        number: 'number',
        date: 'date',
        file: 'file',
        checkbox: 'checkbox',
        radio: 'radio',
        hidden: 'hidden',
      };
      return typeMap[element.type] || 'text';
    }
    return 'unknown';
  }

  private getFieldLabel(element: HTMLElement): string {
    // Method 1: Label with for attribute
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label?.textContent?.trim()) {
        return this.cleanLabel(label.textContent);
      }
    }

    // Method 2: Wrapping label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      const text = this.getTextWithoutInput(parentLabel, element);
      if (text) return this.cleanLabel(text);
    }

    // Method 3: aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return this.cleanLabel(ariaLabel);

    // Method 4: aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl?.textContent) return this.cleanLabel(labelEl.textContent);
    }

    // Method 5: Previous sibling text
    const prev = element.previousElementSibling;
    if (prev?.tagName === 'LABEL' || prev?.tagName === 'SPAN' || prev?.tagName === 'DIV') {
      if (prev.textContent?.trim()) return this.cleanLabel(prev.textContent);
    }

    // Method 6: Parent's previous sibling (common pattern)
    const parentPrev = element.parentElement?.previousElementSibling;
    if (parentPrev?.textContent?.trim()) {
      return this.cleanLabel(parentPrev.textContent);
    }

    // Method 7: Placeholder as last resort
    const placeholder = this.getPlaceholder(element);
    if (placeholder) return placeholder;

    // Method 8: Name attribute cleaned up
    const name = this.getFieldName(element);
    if (name) return this.cleanName(name);

    return '';
  }

  private getTextWithoutInput(container: Element, _exclude: Element): string {
    const clone = container.cloneNode(true) as Element;
    const inputs = clone.querySelectorAll('input, textarea, select');
    inputs.forEach(el => el.remove());
    return clone.textContent?.trim() || '';
  }

  private cleanLabel(text: string): string {
    return text
      .replace(/\*+/g, '')           // Remove asterisks
      .replace(/required/gi, '')     // Remove "required"
      .replace(/optional/gi, '')     // Remove "optional"
      .replace(/\s+/g, ' ')          // Normalize whitespace
      .trim();
  }

  private cleanName(name: string): string {
    return name
      .replace(/[_\-\[\]]/g, ' ')    // Replace separators with space
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase to spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getFieldName(element: HTMLElement): string {
    if (element instanceof HTMLInputElement || 
        element instanceof HTMLTextAreaElement || 
        element instanceof HTMLSelectElement) {
      return element.name || element.id || '';
    }
    return element.getAttribute('name') || element.id || '';
  }

  private getPlaceholder(element: HTMLElement): string | undefined {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      return element.placeholder || undefined;
    }
    return undefined;
  }

  private isRequired(element: HTMLElement): boolean {
    // Check required attribute
    if (element.hasAttribute('required')) return true;
    if (element.getAttribute('aria-required') === 'true') return true;

    // Check for asterisk in label
    const label = this.getFieldLabel(element);
    if (label.includes('*')) return true;

    // Check parent for required indicator
    const parent = element.closest('.field, .form-group, .form-field, [class*="field"]');
    if (parent) {
      const text = parent.textContent || '';
      if (text.includes('*') || /required/i.test(text)) return true;
    }

    return false;
  }

  private getOptions(element: HTMLElement): string[] | undefined {
    if (element instanceof HTMLSelectElement) {
      return Array.from(element.options)
        .map(opt => opt.text.trim())
        .filter(text => text && !text.includes('Select') && !text.includes('Choose'));
    }

    // For radio buttons, find all in the same group
    if (element instanceof HTMLInputElement && element.type === 'radio' && element.name) {
      const radios = document.querySelectorAll(`input[name="${element.name}"]`);
      return Array.from(radios).map(radio => {
        const label = document.querySelector(`label[for="${radio.id}"]`);
        return label?.textContent?.trim() || (radio as HTMLInputElement).value;
      });
    }

    return undefined;
  }

  private getValue(element: HTMLElement): string | undefined {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      return element.value || undefined;
    }
    if (element instanceof HTMLSelectElement) {
      return element.value || undefined;
    }
    return undefined;
  }

  private generateSelector(element: HTMLElement): string {
    // Try ID first
    if (element.id) return `#${element.id}`;

    // Try name
    const name = element.getAttribute('name');
    if (name) return `[name="${name}"]`;

    // Generate path
    const path: string[] = [];
    let current: Element | null = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      const parent: Element | null = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((c: Element) => c.tagName === current!.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }
      
      path.unshift(selector);
      current = parent;
    }

    return path.join(' > ');
  }

  // ============================================
  // Profile Matching
  // ============================================

  private matchToProfile(field: DetectedField): string | null {
    const searchText = `${field.label} ${field.name} ${field.placeholder || ''}`.toLowerCase();

    let bestMatch: { key: string; priority: number } | null = null;

    for (const pattern of FIELD_PATTERNS) {
      for (const keyword of pattern.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          if (!bestMatch || pattern.priority < bestMatch.priority) {
            bestMatch = { key: pattern.profileKey, priority: pattern.priority };
          }
        }
      }
    }

    return bestMatch?.key || null;
  }

  // ============================================
  // Form Metadata
  // ============================================

  private generateFormId(): string {
    return `form-${this.platform}-${Date.now()}`;
  }

  private findSubmitButton(): HTMLElement | undefined {
    if (!this.form) return undefined;

    const selectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Submit")',
      'button:contains("Apply")',
      '[class*="submit"]',
      'button:last-of-type',
    ];

    for (const selector of selectors) {
      try {
        const button = this.form.querySelector<HTMLElement>(selector);
        if (button) return button;
      } catch {
        // Invalid selector, skip
      }
    }

    // Fallback: find button with submit-like text
    const buttons = this.form.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase() || '';
      if (text.includes('submit') || text.includes('apply') || text.includes('send')) {
        return btn;
      }
    }

    return undefined;
  }

  private detectMultiPage(): boolean {
    // Check for pagination indicators
    const indicators = [
      '.step', '.page', '[class*="step"]', '[class*="page"]',
      '.progress-bar', '.stepper', '[class*="progress"]',
      'nav[aria-label*="step"]',
    ];

    for (const selector of indicators) {
      if (document.querySelector(selector)) return true;
    }

    // Check for "Next" button without "Submit"
    const buttons = document.querySelectorAll('button');
    let hasNext = false;
    let hasSubmit = false;

    buttons.forEach(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      if (text.includes('next') || text.includes('continue')) hasNext = true;
      if (text.includes('submit') || text.includes('apply')) hasSubmit = true;
    });

    return hasNext && !hasSubmit;
  }

  private getCurrentPage(): number | undefined {
    // Try to find current step indicator
    const activeStep = document.querySelector('.step.active, .step.current, [class*="step"][class*="active"]');
    if (activeStep) {
      const steps = document.querySelectorAll('.step, [class*="step"]');
      return Array.from(steps).indexOf(activeStep) + 1;
    }
    return undefined;
  }

  private getTotalPages(): number | undefined {
    const steps = document.querySelectorAll('.step, [class*="step"]:not([class*="stepper"])');
    if (steps.length > 1) return steps.length;
    return undefined;
  }

  // ============================================
  // Public API
  // ============================================

  getFields(): DetectedField[] {
    return this.fields;
  }

  getForm(): HTMLFormElement | null {
    return this.form;
  }

  getFieldByProfileKey(profileKey: string): DetectedField | undefined {
    return this.fields.find(f => (f as DetectedField & { profileKey?: string }).profileKey === profileKey);
  }

  getRequiredFields(): DetectedField[] {
    return this.fields.filter(f => f.required);
  }

  getUnfilledFields(): DetectedField[] {
    return this.fields.filter(f => !f.value || f.value.trim() === '');
  }
}

export default FormDetector;
