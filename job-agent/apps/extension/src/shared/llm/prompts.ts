/**
 * Prompt Templates for Form Filling
 */

export const PROMPTS = {
  /**
   * System prompt for form filling assistance
   */
  FORM_FILLING_SYSTEM: `You are an AI assistant helping to fill out job application forms. Your role is to:
1. Generate professional, concise responses based on the candidate's profile
2. Match form fields to the appropriate profile data
3. Never fabricate information not provided in the profile
4. Keep responses relevant and appropriate for job applications
5. Use a professional tone suitable for formal applications`,

  /**
   * Match field to profile
   */
  FIELD_MATCHING: (fieldLabel: string, fieldType: string, profileKeys: string[]) => `
Given this form field:
Label: "${fieldLabel}"
Type: ${fieldType}

Match it to ONE of these profile fields. Respond with ONLY the exact field name, or "null" if no match:
${profileKeys.join(', ')}

Your response (just the field name or null):`,

  /**
   * Generate response for a question
   */
  GENERATE_RESPONSE: (question: string, profileContext: string, previousResponses?: string[]) => {
    let prompt = `Profile Information:
${profileContext}

`;
    if (previousResponses && previousResponses.length > 0) {
      prompt += `Similar past responses (for reference, adapt as needed):
${previousResponses.map((r, i) => `${i + 1}. ${r}`).join('\n')}

`;
    }
    prompt += `Question: ${question}

Generate a professional response (2-4 sentences, or more if the question requires):`;
    return prompt;
  },

  /**
   * Summarize job description
   */
  JOB_SUMMARY: (jobDescription: string) => `
Summarize this job description in 2-3 sentences, highlighting the role, key requirements, and any standout aspects:

${jobDescription.substring(0, 3000)}

Summary:`,

  /**
   * Extract tech stack
   */
  EXTRACT_TECH: (jobDescription: string) => `
Extract all technologies, programming languages, frameworks, tools, and technical skills mentioned. Return as a comma-separated list only.

${jobDescription.substring(0, 2000)}

Technologies:`,

  /**
   * Calculate relevance score
   */
  RELEVANCE_SCORE: (skills: string[], jobDescription: string) => `
Rate how well this candidate matches the job (0-100).

Candidate Skills: ${skills.join(', ')}

Job: ${jobDescription.substring(0, 1500)}

Score (number only):`,

  /**
   * Cover letter generation
   */
  COVER_LETTER: (
    profileContext: string,
    companyName: string,
    jobTitle: string,
    jobDescription: string
  ) => `
Write a professional cover letter for this candidate applying to ${companyName} for the ${jobTitle} position.

Candidate Profile:
${profileContext}

Job Description:
${jobDescription.substring(0, 1500)}

Write a compelling cover letter (3-4 paragraphs):`,

  /**
   * "Why do you want to work here" response
   */
  WHY_THIS_COMPANY: (profileContext: string, companyName: string, companyInfo?: string) => `
Generate a response for "Why do you want to work at ${companyName}?"

Candidate Background:
${profileContext}

${companyInfo ? `Company Info:\n${companyInfo}\n` : ''}
Write a genuine, professional response connecting the candidate's background to the company:`,

  /**
   * Strengths and weaknesses
   */
  STRENGTHS_WEAKNESSES: (profileContext: string, type: 'strength' | 'weakness') => `
Based on this profile, generate a professional response about a ${type}:

${profileContext}

Write a concise response about a ${type} that's appropriate for a job interview:`,
};

/**
 * Common field patterns for auto-matching
 */
export const FIELD_PATTERNS = {
  firstName: ['first name', 'firstname', 'given name', 'forename'],
  lastName: ['last name', 'lastname', 'surname', 'family name'],
  email: ['email', 'e-mail', 'email address'],
  phone: ['phone', 'telephone', 'mobile', 'cell', 'contact number'],
  linkedIn: ['linkedin', 'linked in', 'linkedin url', 'linkedin profile'],
  portfolio: ['portfolio', 'website', 'personal site', 'personal website'],
  github: ['github', 'git hub', 'github url'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zipCode: ['zip', 'zip code', 'postal code', 'postcode'],
  country: ['country', 'nation'],
  workAuthorization: ['work authorization', 'authorized to work', 'legally authorized', 'right to work'],
  sponsorship: ['sponsorship', 'visa sponsorship', 'require sponsorship', 'need sponsorship'],
  salary: ['salary', 'compensation', 'expected salary', 'salary expectation', 'desired salary'],
  startDate: ['start date', 'available from', 'availability', 'when can you start'],
  experience: ['years of experience', 'experience', 'years experience'],
};

/**
 * Match field label to profile key using patterns
 */
export function matchFieldPattern(label: string): string | null {
  const normalizedLabel = label.toLowerCase().trim();
  
  for (const [key, patterns] of Object.entries(FIELD_PATTERNS)) {
    if (patterns.some(pattern => normalizedLabel.includes(pattern))) {
      return key;
    }
  }
  
  return null;
}

export default PROMPTS;
