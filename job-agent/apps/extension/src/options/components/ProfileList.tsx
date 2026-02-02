/**
 * ProfileList - Sidebar list of profiles
 * FIXED: resumeDataUrl, activeProfileId prop
 */

import { useState, useRef, useEffect } from 'react';
import { Plus, Upload, MoreVertical, Check, Copy, Download, Trash2, User } from 'lucide-react';
import type { UserProfile } from '../../shared/types/profile';

interface ProfileListProps {
  profiles: UserProfile[];
  activeProfileId: string | null;
  selectedProfileId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onImport: () => void;
  onSetActive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProfileList({
  profiles,
  activeProfileId,
  selectedProfileId,
  onSelect,
  onCreateNew,
  onImport,
  onSetActive,
  onDuplicate,
  onExport,
  onDelete,
}: ProfileListProps) {
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const contextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const calculateCompleteness = (profile: UserProfile): number => {
    let filled = 0;
    let total = 0;

    // Personal info fields
    const personal = profile.personalInfo;
    const personalFields = [
      personal.firstName, personal.lastName, personal.email, personal.phone,
      personal.address?.city, personal.address?.state, personal.address?.country
    ];
    total += personalFields.length;
    filled += personalFields.filter(f => f && f.trim()).length;

    // Education
    total += 1;
    if (profile.education && profile.education.length > 0) filled += 1;

    // Work history
    total += 1;
    if (profile.workHistory && profile.workHistory.length > 0) filled += 1;

    // Skills
    total += 1;
    const skills = profile.skills;
    if (skills && (skills.technical?.length > 0 || skills.soft?.length > 0)) filled += 1;

    // Documents - FIXED: use resumeDataUrl
    total += 1;
    if (profile.documents?.resumeDataUrl) filled += 1;

    return Math.round((filled / total) * 100);
  };

  const getProfileDisplayName = (profile: UserProfile): string => {
    if (profile.name && profile.name.trim() && profile.name !== 'New Profile') {
      return profile.name;
    }
    
    const firstName = profile.personalInfo?.firstName?.trim();
    const lastName = profile.personalInfo?.lastName?.trim();
    
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }
    
    if (profile.personalInfo?.email) {
      return profile.personalInfo.email.split('@')[0];
    }
    
    return 'Unnamed Profile';
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Profiles</h3>
          <div className="flex gap-1">
            <button
              onClick={onImport}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Import Profile"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onCreateNew}
              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Create New Profile"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Profile List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {profiles.length === 0 ? (
          <div className="text-center py-8 px-4">
            <User className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 mb-3">No profiles yet</p>
            <button
              onClick={onCreateNew}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first profile
            </button>
          </div>
        ) : (
          profiles.map((profile) => {
            const completeness = calculateCompleteness(profile);
            const isActive = profile.id === activeProfileId;
            const isSelected = profile.id === selectedProfileId;
            const displayName = getProfileDisplayName(profile);

            return (
              <div
                key={profile.id}
                onClick={() => onSelect(profile.id)}
                onContextMenu={(e) => handleContextMenu(e, profile.id)}
                className={`
                  relative p-2.5 rounded-lg cursor-pointer transition-all group
                  ${isSelected 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {displayName}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                          <Check className="w-2.5 h-2.5 mr-0.5" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.personalInfo?.email || 'No email'}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => handleContextMenu(e, profile.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Completeness bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        completeness >= 80 ? 'bg-green-500' :
                        completeness >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 w-8">{completeness}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextRef}
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => { onSetActive(contextMenu.id); setContextMenu(null); }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Set as Active
          </button>
          <button
            onClick={() => { onDuplicate(contextMenu.id); setContextMenu(null); }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          <button
            onClick={() => { onExport(contextMenu.id); setContextMenu(null); }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            onClick={() => { onDelete(contextMenu.id); setContextMenu(null); }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
