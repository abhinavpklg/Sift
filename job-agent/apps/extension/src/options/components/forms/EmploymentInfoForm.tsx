/**
 * EmploymentInfoForm - Work authorization and EEO information
 */

import type { EmploymentInfo, WorkAuthorization, DisabilityStatus, VeteranStatus } from '../../../shared/types/profile';

interface EmploymentInfoFormProps {
  data: EmploymentInfo;
  onChange: (data: EmploymentInfo) => void;
}

export function EmploymentInfoForm({ data, onChange }: EmploymentInfoFormProps) {
  const updateField = <K extends keyof EmploymentInfo>(key: K, value: EmploymentInfo[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* Work Authorization */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Work Authorization</h3>
        <p className="text-sm text-gray-500 mb-4">Your legal authorization to work</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Authorization Status
            </label>
            <select
              value={data.workAuthorization}
              onChange={(e) => updateField('workAuthorization', e.target.value as WorkAuthorization)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="us_citizen">U.S. Citizen</option>
              <option value="permanent_resident">Permanent Resident (Green Card)</option>
              <option value="visa_holder">Visa Holder</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="sponsorship"
              checked={data.requiresSponsorship}
              onChange={(e) => updateField('requiresSponsorship', e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="sponsorship" className="text-sm text-gray-700 dark:text-gray-300">
              I will require sponsorship for employment visa status now or in the future
            </label>
          </div>
        </div>
      </section>

      {/* EEO Information */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Equal Employment Opportunity
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          This information is voluntary and used for statistical purposes only
        </p>

        <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender (optional)
            </label>
            <select
              value={data.gender || ''}
              onChange={(e) => updateField('gender', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Ethnicity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ethnicity (optional)
            </label>
            <select
              value={data.ethnicity || ''}
              onChange={(e) => updateField('ethnicity', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Prefer not to say</option>
              <option value="american_indian">American Indian or Alaska Native</option>
              <option value="asian">Asian</option>
              <option value="black">Black or African American</option>
              <option value="hispanic">Hispanic or Latino</option>
              <option value="pacific_islander">Native Hawaiian or Pacific Islander</option>
              <option value="white">White</option>
              <option value="two_or_more">Two or More Races</option>
            </select>
          </div>

          {/* Veteran Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Veteran Status
            </label>
            <select
              value={data.veteranStatus}
              onChange={(e) => updateField('veteranStatus', e.target.value as VeteranStatus)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="veteran">I am a protected veteran</option>
              <option value="not_veteran">I am not a protected veteran</option>
            </select>
          </div>

          {/* Disability Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Disability Status
            </label>
            <select
              value={data.disability}
              onChange={(e) => updateField('disability', e.target.value as DisabilityStatus)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="yes">Yes, I have a disability</option>
              <option value="no">No, I don't have a disability</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EmploymentInfoForm;
