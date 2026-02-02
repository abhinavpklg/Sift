/**
 * ProfilePage - Main profile management page
 * FIXED: Use activeProfile?.id instead of activeProfileId
 */

import { useState, useRef } from 'react';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileList } from '../components/ProfileList';
import { ProfileForm } from '../components/ProfileForm';
import { User, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../../shared/types/profile';

export function ProfilePage() {
  const {
    profiles,
    activeProfile,  // FIXED: This is an object, not ID
    isLoading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    duplicateProfile,
    exportProfile,
    importProfile,
  } = useProfiles();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || null;
  
  // FIXED: Derive activeProfileId from activeProfile object
  const activeProfileId = activeProfile?.id || null;

  const handleSelect = (id: string) => {
    setSelectedProfileId(id);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setSelectedProfileId(null);
    setIsCreatingNew(true);
  };

  const handleSave = async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> | Partial<UserProfile>) => {
    setIsSaving(true);
    try {
      if (isCreatingNew) {
        const newProfile = await createProfile(profileData as Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>);
        if (newProfile) {
          setSelectedProfileId(newProfile.id);
          setIsCreatingNew(false);
        }
      } else if (selectedProfileId) {
        await updateProfile(selectedProfileId, profileData as Partial<UserProfile>);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsCreatingNew(false);
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      await deleteProfile(id);
      if (selectedProfileId === id) {
        setSelectedProfileId(profiles.find(p => p.id !== id)?.id || null);
      }
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importProfile(file);
      if (imported) {
        setSelectedProfileId(imported.id);
        setIsCreatingNew(false);
      }
    } catch (err) {
      alert('Failed to import profile. Please check the file format.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Sidebar - Profile List */}
      <div className="w-64 flex-shrink-0 h-full">
        <ProfileList
          profiles={profiles}
          activeProfileId={activeProfileId}
          selectedProfileId={selectedProfileId}
          onSelect={handleSelect}
          onCreateNew={handleCreateNew}
          onImport={handleImport}
          onSetActive={setActiveProfile}
          onDuplicate={duplicateProfile}
          onExport={exportProfile}
          onDelete={handleDelete}
        />
      </div>

      {/* Main Content - Profile Form */}
      <div className="flex-1 h-full overflow-hidden">
        {(selectedProfile || isCreatingNew) ? (
          <ProfileForm
            profile={selectedProfile}
            isNew={isCreatingNew}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-6">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {profiles.length === 0 ? 'Create Your First Profile' : 'Select a Profile'}
              </h3>
              <p className="text-gray-500 mb-6">
                {profiles.length === 0
                  ? 'Profiles store your personal information, work history, and skills for auto-filling job applications.'
                  : 'Choose a profile from the sidebar to view or edit, or create a new one.'}
              </p>
              <button
                onClick={handleCreateNew}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create New Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
