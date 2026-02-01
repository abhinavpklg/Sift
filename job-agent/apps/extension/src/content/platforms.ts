/**
 * ATS Platform Detection
 */

import type { ATSPlatform, PlatformInfo } from './types';

interface PlatformPattern {
  platform: ATSPlatform;
  urlPatterns: RegExp[];
  applicationPatterns: RegExp[];
  selectors: { jobTitle?: string; company?: string; applicationForm?: string };
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    platform: 'greenhouse',
    urlPatterns: [/boards\.greenhouse\.io/i, /jobs\.greenhouse\.io/i, /job-boards\.greenhouse\.io/i],
    applicationPatterns: [/\/jobs\/\d+/i, /#\/jobs\/\d+/i, /application/i],
    selectors: { jobTitle: '.app-title, h1.heading', company: '.company-name', applicationForm: '#application, form[data-controller="application"]' },
  },
  {
    platform: 'lever',
    urlPatterns: [/jobs\.lever\.co/i, /\.lever\.co/i],
    applicationPatterns: [/\/apply$/i, /\/apply\//i],
    selectors: { jobTitle: '.posting-headline h2', company: '.main-header-logo img[alt]', applicationForm: '.application-form, form.template-btn-submit' },
  },
  {
    platform: 'ashby',
    urlPatterns: [/jobs\.ashbyhq\.com/i, /\.ashbyhq\.com/i],
    applicationPatterns: [/\/application/i, /\/apply/i],
    selectors: { jobTitle: 'h1[class*="JobTitle"], h1', company: '[class*="CompanyName"]', applicationForm: 'form[class*="Application"], form' },
  },
  {
    platform: 'workday',
    urlPatterns: [/\.myworkdayjobs\.com/i, /\.myworkdaysite\.com/i, /workday\.com\/.*\/job/i],
    applicationPatterns: [/\/job\//i, /\/apply/i],
    selectors: { jobTitle: '[data-automation-id="jobPostingTitle"], h1', company: '[data-automation-id="companyLogo"] img[alt]', applicationForm: '[data-automation-id="applicationForm"], form' },
  },
  {
    platform: 'icims',
    urlPatterns: [/\.icims\.com/i, /icims/i],
    applicationPatterns: [/\/jobs\/\d+\/job/i, /\/apply/i],
    selectors: { jobTitle: '.iCIMS_JobTitle, h1', company: '.iCIMS_CompanyName', applicationForm: '.iCIMS_MainWrapper form, form' },
  },
  {
    platform: 'smartrecruiters',
    urlPatterns: [/\.smartrecruiters\.com/i, /jobs\.smartrecruiters\.com/i],
    applicationPatterns: [/\/applicant\/apply/i, /\/apply/i],
    selectors: { jobTitle: 'h1.job-title, h1', company: '.company-name', applicationForm: '.application-form, form' },
  },
  {
    platform: 'jobvite',
    urlPatterns: [/\.jobvite\.com/i, /jobs\.jobvite\.com/i],
    applicationPatterns: [/\/apply/i, /\/job\//i],
    selectors: { jobTitle: '.jv-job-detail-title, h1', company: '.jv-logo img[alt]', applicationForm: '.jv-application, form' },
  },
  {
    platform: 'bamboohr',
    urlPatterns: [/\.bamboohr\.com/i],
    applicationPatterns: [/\/jobs\/view\.php/i, /\/applicant_tracking/i],
    selectors: { jobTitle: '.JobDetails__title, h2', company: '.Header__logo img[alt]', applicationForm: '.ApplicationForm, form' },
  },
  {
    platform: 'breezy',
    urlPatterns: [/\.breezy\.hr/i],
    applicationPatterns: [/\/p\//i, /\/apply/i],
    selectors: { jobTitle: '.position-title, h1', company: '.company-title', applicationForm: '.application-form, form' },
  },
  {
    platform: 'workable',
    urlPatterns: [/\.workable\.com/i, /apply\.workable\.com/i],
    applicationPatterns: [/\/j\//i, /\/apply/i],
    selectors: { jobTitle: '[data-ui="job-title"], h1', company: '[data-ui="company-name"]', applicationForm: '[data-ui="application-form"], form' },
  },
];

export function detectPlatform(url: string): ATSPlatform {
  for (const pattern of PLATFORM_PATTERNS) {
    if (pattern.urlPatterns.some((regex) => regex.test(url))) return pattern.platform;
  }
  return 'unknown';
}

export function isApplicationPage(url: string, platform: ATSPlatform): boolean {
  const pattern = PLATFORM_PATTERNS.find((p) => p.platform === platform);
  if (!pattern) return false;
  return pattern.applicationPatterns.some((regex) => regex.test(url));
}

export function getPlatformSelectors(platform: ATSPlatform): PlatformPattern['selectors'] | null {
  const pattern = PLATFORM_PATTERNS.find((p) => p.platform === platform);
  return pattern?.selectors ?? null;
}

export function extractJobInfo(platform: ATSPlatform): { jobTitle?: string; company?: string } {
  const selectors = getPlatformSelectors(platform);
  if (!selectors) return {};
  let jobTitle: string | undefined;
  let company: string | undefined;

  if (selectors.jobTitle) {
    for (const selector of selectors.jobTitle.split(', ')) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) { jobTitle = el.textContent.trim(); break; }
    }
  }
  if (selectors.company) {
    for (const selector of selectors.company.split(', ')) {
      const el = document.querySelector(selector);
      if (el) {
        if (el instanceof HTMLImageElement && el.alt) { company = el.alt.trim(); }
        else if (el.textContent?.trim()) { company = el.textContent.trim(); }
        if (company) break;
      }
    }
  }
  return { jobTitle, company };
}

export function getPlatformInfo(url: string = window.location.href): PlatformInfo {
  const platform = detectPlatform(url);
  const isAppPage = isApplicationPage(url, platform);
  const jobInfo = extractJobInfo(platform);
  return { platform, isApplicationPage: isAppPage, jobTitle: jobInfo.jobTitle, company: jobInfo.company };
}

export function hasApplicationForm(platform: ATSPlatform): boolean {
  const selectors = getPlatformSelectors(platform);
  if (!selectors?.applicationForm) return false;
  return selectors.applicationForm.split(', ').some((s) => document.querySelector(s) !== null);
}

export { PLATFORM_PATTERNS };
