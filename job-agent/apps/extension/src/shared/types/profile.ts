/**
 * User Profile Types for Sift
 */

export interface UserProfile {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  personalInfo: PersonalInfo;
  education: Education[];
  workHistory: WorkExperience[];
  skills: Skills;
  documents: Documents;
  employmentInfo: EmploymentInfo;
  savedResponses: SavedResponse[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  linkedIn: string;
  portfolio: string;
  github?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  gpa?: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

export interface Skills {
  technical: string[];
  soft: string[];
  languages: LanguageProficiency[];
  certifications: string[];
}

export interface LanguageProficiency {
  language: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
}

export interface Documents {
  resumeDataUrl?: string;
  resumeFileName?: string;
  coverLetterTemplate?: string;
}

export interface EmploymentInfo {
  workAuthorization: WorkAuthorization;
  requiresSponsorship: boolean;
  disability: DisabilityStatus;
  veteranStatus: VeteranStatus;
  gender?: string;
  ethnicity?: string;
  ageRange?: string;
}

export type WorkAuthorization = 'us_citizen' | 'permanent_resident' | 'visa_holder' | 'other';
export type DisabilityStatus = 'yes' | 'no' | 'prefer_not_to_say';
export type VeteranStatus = 'veteran' | 'not_veteran' | 'prefer_not_to_say';

export interface SavedResponse {
  id: string;
  keywords: string[];
  question: string;
  response: string;
  timesUsed: number;
  lastUsed: string;
  createdAt: string;
}

export function createEmptyProfile(name: string = 'New Profile'): Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    isActive: false,
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'United States' },
      linkedIn: '',
      portfolio: '',
      github: '',
    },
    education: [],
    workHistory: [],
    skills: { technical: [], soft: [], languages: [], certifications: [] },
    documents: {},
    employmentInfo: {
      workAuthorization: 'us_citizen',
      requiresSponsorship: false,
      disability: 'prefer_not_to_say',
      veteranStatus: 'prefer_not_to_say',
    },
    savedResponses: [],
  };
}

export function getFullName(info: PersonalInfo): string {
  return `${info.firstName} ${info.lastName}`.trim();
}

export function isProfileComplete(profile: UserProfile): boolean {
  const { personalInfo } = profile;
  return !!(personalInfo.firstName && personalInfo.lastName && personalInfo.email);
}
