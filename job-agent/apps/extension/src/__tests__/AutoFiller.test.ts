/**
 * AutoFiller Tests
 * Tests for the AutoFiller class that fills form fields with profile data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutoFiller } from '../content/AutoFiller';
import type { DetectedForm, DetectedField } from '../content/types';
import type { UserProfile } from '../shared/types/profile';

// ============================================
// Mock Data matching actual types
// ============================================

const mockProfile: UserProfile = {
  id: 'test-profile-1',
  name: 'Test Profile',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-31T00:00:00Z',
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
    },
    linkedIn: 'https://linkedin.com/in/johndoe',
    portfolio: 'https://johndoe.dev',
    github: 'https://github.com/johndoe',
  },
  education: [
    {
      id: 'edu-1',
      institution: 'Stanford University',
      degree: 'BS',
      fieldOfStudy: 'Computer Science',
      gpa: '3.8',
      startDate: '2015-09-01',
      endDate: '2019-06-01',
      current: false,
    },
  ],
  workHistory: [
    {
      id: 'work-1',
      company: 'Acme Corp',
      title: 'Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2019-07-01',
      endDate: '',
      current: true,
      description: 'Building awesome software',
      technologies: ['TypeScript', 'React', 'Node.js'],
    },
  ],
  skills: {
    technical: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    soft: ['Communication', 'Leadership', 'Problem Solving'],
    languages: [
      { language: 'English', proficiency: 'native' },
      { language: 'Spanish', proficiency: 'conversational' },
    ],
    certifications: ['AWS Certified Developer'],
  },
  documents: {
    resumeFileName: 'john_doe_resume.pdf',
  },
  employmentInfo: {
    workAuthorization: 'us_citizen',
    requiresSponsorship: false,
    disability: 'prefer_not_to_say',
    veteranStatus: 'not_veteran',
  },
  savedResponses: [],
};

// Helper to create mock fields with profileKey
function createMockField(overrides: Partial<DetectedField> & { profileKey?: string } = {}): DetectedField & { profileKey?: string } {
  const id = overrides.id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const input = document.createElement('input');
  input.id = id;
  input.name = overrides.name || 'test-field';
  document.body.appendChild(input);
  
  const baseField: DetectedField = {
    id,
    name: overrides.name || 'test-field',
    type: overrides.type || 'text',
    label: overrides.label || 'Test Field',
    required: overrides.required || false,
    selector: `#${id}`,
    element: overrides.element || input,
    value: overrides.value,
  };
  
  // Add profileKey as extended property
  return { ...baseField, profileKey: overrides.profileKey };
}

function createMockForm(fields: (DetectedField & { profileKey?: string })[]): DetectedForm {
  return {
    id: 'form-test-1',
    url: 'https://jobs.lever.co/test-company/apply',
    platform: 'lever',
    fields: fields as DetectedField[],
    isMultiPage: false,
  };
}

// ============================================
// Tests
// ============================================

describe('AutoFiller', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create an AutoFiller instance with form, profile, and options', () => {
      const field = createMockField({ profileKey: 'personalInfo.firstName' });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile);
      
      expect(autoFiller).toBeInstanceOf(AutoFiller);
    });

    it('should accept custom options', () => {
      const field = createMockField({ profileKey: 'personalInfo.firstName' });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, {
        delayBetweenFields: 50,
        skipFilled: false,
        simulateTyping: true,
      });
      
      expect(autoFiller).toBeInstanceOf(AutoFiller);
    });
  });

  describe('fillAll', () => {
    it('should fill a text input field with firstName', async () => {
      const field = createMockField({
        name: 'firstName',
        type: 'text',
        profileKey: 'personalInfo.firstName',
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      const result = await autoFiller.fillAll();
      
      const input = document.querySelector(`#${field.id}`) as HTMLInputElement;
      expect(input.value).toBe('John');
      expect(result.filledFields).toBe(1);
    });

    it('should fill an email input field', async () => {
      const field = createMockField({
        name: 'email',
        type: 'email',
        profileKey: 'personalInfo.email',
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      const result = await autoFiller.fillAll();
      
      const input = document.querySelector(`#${field.id}`) as HTMLInputElement;
      expect(input.value).toBe('john.doe@example.com');
      expect(result.filledFields).toBe(1);
    });

    it('should fill a phone input field', async () => {
      const field = createMockField({
        name: 'phone',
        type: 'tel',
        profileKey: 'personalInfo.phone',
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      const input = document.querySelector(`#${field.id}`) as HTMLInputElement;
      expect(input.value).toBe('555-123-4567');
    });

    it('should fill LinkedIn URL field', async () => {
      const field = createMockField({
        name: 'linkedin',
        type: 'url',
        profileKey: 'personalInfo.linkedIn',
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      const input = document.querySelector(`#${field.id}`) as HTMLInputElement;
      expect(input.value).toBe('https://linkedin.com/in/johndoe');
    });

    it('should skip fields without profileKey', async () => {
      const field = createMockField({
        name: 'unknown',
        type: 'text',
        // No profileKey
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      const result = await autoFiller.fillAll();
      
      expect(result.skippedFields).toBe(1);
      expect(result.filledFields).toBe(0);
    });

    it('should skip already filled fields when skipFilled is true', async () => {
      const field = createMockField({
        name: 'firstName',
        type: 'text',
        profileKey: 'personalInfo.firstName',
        value: 'Existing Value',
      });
      
      // Set the input value before fill
      const input = document.querySelector(`#${field.id}`) as HTMLInputElement;
      input.value = 'Existing Value';
      
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { 
        delayBetweenFields: 0,
        skipFilled: true,
      });
      const result = await autoFiller.fillAll();
      
      expect(input.value).toBe('Existing Value');
      expect(result.skippedFields).toBeGreaterThanOrEqual(0);
    });

    it('should fill only required fields when onlyRequired is true', async () => {
      const requiredField = createMockField({
        id: 'required-field',
        name: 'email',
        type: 'email',
        required: true,
        profileKey: 'personalInfo.email',
      });
      
      const optionalField = createMockField({
        id: 'optional-field',
        name: 'github',
        type: 'url',
        required: false,
        profileKey: 'personalInfo.github',
      });
      
      const form = createMockForm([requiredField, optionalField]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { 
        delayBetweenFields: 0,
        onlyRequired: true,
      });
      const result = await autoFiller.fillAll();
      
      const emailInput = document.querySelector('#required-field') as HTMLInputElement;
      const githubInput = document.querySelector('#optional-field') as HTMLInputElement;
      
      expect(emailInput.value).toBe('john.doe@example.com');
      expect(githubInput.value).toBe('');
      expect(result.filledFields).toBe(1);
    });

    it('should return correct FormFillResult', async () => {
      const field1 = createMockField({
        id: 'f1',
        name: 'firstName',
        profileKey: 'personalInfo.firstName',
      });
      const field2 = createMockField({
        id: 'f2', 
        name: 'lastName',
        profileKey: 'personalInfo.lastName',
      });
      const field3 = createMockField({
        id: 'f3',
        name: 'unknown',
        // No profileKey - will be skipped
      });
      
      const form = createMockForm([field1, field2, field3]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      const result = await autoFiller.fillAll();
      
      expect(result.formId).toBe('form-test-1');
      expect(result.totalFields).toBe(3);
      expect(result.filledFields).toBe(2);
      expect(result.skippedFields).toBe(1);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.results).toHaveLength(3);
    });
  });

  describe('event triggering', () => {
    it('should trigger input and change events', async () => {
      const field = createMockField({
        name: 'firstName',
        type: 'text',
        profileKey: 'personalInfo.firstName',
      });
      const form = createMockForm([field]);
      
      const input = document.querySelector(`#${field.id}`) as HTMLInputElement;
      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      input.addEventListener('input', inputHandler);
      input.addEventListener('change', changeHandler);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      expect(inputHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalled();
    });
  });

  describe('select fields', () => {
    it('should fill select dropdown by matching value', async () => {
      const select = document.createElement('select');
      select.id = 'country-select';
      select.innerHTML = `
        <option value="">Select...</option>
        <option value="USA">United States</option>
        <option value="CAN">Canada</option>
      `;
      document.body.appendChild(select);
      
      const field: DetectedField & { profileKey?: string } = {
        id: 'country-select',
        name: 'country',
        type: 'select',
        label: 'Country',
        required: false,
        selector: '#country-select',
        element: select,
        profileKey: 'personalInfo.address.country',
      };
      
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      expect(select.value).toBe('USA');
    });
  });

  describe('textarea fields', () => {
    it('should fill textarea fields', async () => {
      const textarea = document.createElement('textarea');
      textarea.id = 'summary-textarea';
      document.body.appendChild(textarea);
      
      // Add a custom field to profile for testing
      const profileWithSummary = {
        ...mockProfile,
        workHistory: [{
          ...mockProfile.workHistory[0],
          description: 'Building awesome software at Acme Corp',
        }],
      };
      
      const field: DetectedField & { profileKey?: string } = {
        id: 'summary-textarea',
        name: 'summary',
        type: 'textarea',
        label: 'Summary',
        required: false,
        selector: '#summary-textarea',
        element: textarea,
        profileKey: 'workHistory.0.description',
      };
      
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, profileWithSummary, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      expect(textarea.value).toBe('Building awesome software at Acme Corp');
    });
  });

  describe('helper methods', () => {
    it('should return results via getResults', async () => {
      const field = createMockField({
        name: 'firstName',
        profileKey: 'personalInfo.firstName',
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      const results = autoFiller.getResults();
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it('should return filled count via getFilledCount', async () => {
      const field = createMockField({
        name: 'firstName',
        profileKey: 'personalInfo.firstName',
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      expect(autoFiller.getFilledCount()).toBe(1);
    });

    it('should return error count via getErrorCount', async () => {
      const field = createMockField({
        name: 'unknown',
        // No profileKey - will error
      });
      const form = createMockForm([field]);
      
      const autoFiller = new AutoFiller(form, mockProfile, { delayBetweenFields: 0 });
      await autoFiller.fillAll();
      
      // Fields without profileKey are "skipped", not "errors"
      // So error count should be 0
      expect(autoFiller.getErrorCount()).toBe(0);
    });
  });
});
