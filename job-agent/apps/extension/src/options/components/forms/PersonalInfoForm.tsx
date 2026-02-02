/**
 * PersonalInfoForm - Personal information section
 * UPDATED: 3-column grid on large screens
 */

import type { PersonalInfo } from '../../../shared/types/profile';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const update = <K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) => {
    onChange({ ...data, [key]: value });
  };

  const updateAddress = (key: keyof NonNullable<PersonalInfo['address']>, value: string) => {
    onChange({
      ...data,
      address: { ...data.address, [key]: value },
    });
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => update('firstName', e.target.value)}
              className={inputClass}
              placeholder="John"
            />
          </div>
          <div>
            <label className={labelClass}>
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.lastName || ''}
              onChange={(e) => update('lastName', e.target.value)}
              className={inputClass}
              placeholder="Doe"
            />
          </div>
          <div>
            <label className={labelClass}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={data.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass}
              placeholder="555-123-4567"
            />
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
          Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <label className={labelClass}>Street Address</label>
            <input
              type="text"
              value={data.address?.street || ''}
              onChange={(e) => updateAddress('street', e.target.value)}
              className={inputClass}
              placeholder="123 Main St"
            />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              value={data.address?.city || ''}
              onChange={(e) => updateAddress('city', e.target.value)}
              className={inputClass}
              placeholder="San Francisco"
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              value={data.address?.state || ''}
              onChange={(e) => updateAddress('state', e.target.value)}
              className={inputClass}
              placeholder="CA"
            />
          </div>
          <div>
            <label className={labelClass}>ZIP Code</label>
            <input
              type="text"
              value={data.address?.zipCode || ''}
              onChange={(e) => updateAddress('zipCode', e.target.value)}
              className={inputClass}
              placeholder="94105"
            />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input
              type="text"
              value={data.address?.country || ''}
              onChange={(e) => updateAddress('country', e.target.value)}
              className={inputClass}
              placeholder="United States"
            />
          </div>
        </div>
      </section>

      {/* Online Profiles */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
          Online Profiles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>LinkedIn</label>
            <input
              type="url"
              value={data.linkedIn || ''}
              onChange={(e) => update('linkedIn', e.target.value)}
              className={inputClass}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>
          <div>
            <label className={labelClass}>Portfolio Website</label>
            <input
              type="url"
              value={data.portfolio || ''}
              onChange={(e) => update('portfolio', e.target.value)}
              className={inputClass}
              placeholder="https://johndoe.dev"
            />
          </div>
          <div>
            <label className={labelClass}>GitHub</label>
            <input
              type="url"
              value={data.github || ''}
              onChange={(e) => update('github', e.target.value)}
              className={inputClass}
              placeholder="https://github.com/johndoe"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
