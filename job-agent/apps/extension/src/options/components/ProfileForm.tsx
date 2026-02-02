/**
 * ProfileForm - Tabbed form for editing profile
 * UPDATED: Full width on large screens
 */

import { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Code, 
  FileText, 
  Shield,
  Save,
  X,
  Edit2
} from 'lucide-react';
import type { UserProfile } from '../../shared/types/profile';
import { createEmptyProfile } from '../../shared/types/profile';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { EducationForm } from './forms/EducationForm';
import { WorkHistoryForm } from './forms/WorkHistoryForm';
import { SkillsForm } from './forms/SkillsForm';
import { DocumentsForm } from './forms/DocumentsForm';
import { EmploymentInfoForm } from './forms/EmploymentInfoForm';

type Tab = 'personal' | 'education' | 'work' | 'skills' | 'documents' | 'employment';

interface ProfileFormProps {
  profile: UserProfile | null;
  isNew: boolean;
  onSave: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> | Partial<UserProfile>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'work', label: 'Work', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'employment', label: 'EEO', icon: Shield },
];

export function ProfileForm({ profile, isNew, onSave, onCancel, isSaving }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [formData, setFormData] = useState<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>(
    profile ? { ...profile } : createEmptyProfile()
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
    } else {
      setFormData(createEmptyProfile());
    }
    setHasChanges(false);
    setActiveTab('personal');
  }, [profile?.id, isNew]);

  const updateFormData = <K extends keyof typeof formData>(
    key: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  const getDisplayName = (): string => {
    if (formData.name && formData.name.trim()) {
      return formData.name;
    }
    const firstName = formData.personalInfo?.firstName?.trim();
    const lastName = formData.personalInfo?.lastName?.trim();
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }
    return isNew ? 'New Profile' : 'Unnamed Profile';
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => updateFormData('name', e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                placeholder="Profile name..."
                className="text-xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getDisplayName()}
                </h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  title="Edit profile name"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            {hasChanges && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">Edit profile details</p>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6">
        <nav className="flex gap-1 -mb-px">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Form Content - Scrollable, FULL WIDTH */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Responsive grid: 1 col on small, 2 cols on large */}
          <div className="max-w-6xl">
            {activeTab === 'personal' && (
              <PersonalInfoForm
                data={formData.personalInfo}
                onChange={(data) => updateFormData('personalInfo', data)}
              />
            )}
            {activeTab === 'education' && (
              <EducationForm
                data={formData.education}
                onChange={(data) => updateFormData('education', data)}
              />
            )}
            {activeTab === 'work' && (
              <WorkHistoryForm
                data={formData.workHistory}
                onChange={(data) => updateFormData('workHistory', data)}
              />
            )}
            {activeTab === 'skills' && (
              <SkillsForm
                data={formData.skills}
                onChange={(data) => updateFormData('skills', data)}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentsForm
                data={formData.documents}
                onChange={(data) => updateFormData('documents', data)}
              />
            )}
            {activeTab === 'employment' && (
              <EmploymentInfoForm
                data={formData.employmentInfo}
                onChange={(data) => updateFormData('employmentInfo', data)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
