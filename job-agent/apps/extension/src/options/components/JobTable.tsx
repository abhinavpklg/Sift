/**
 * JobTable - Applied jobs table with actions
 * FIXED: Status dropdown uses fixed positioning to render on top
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ExternalLink, 
  Trash2, 
  MessageSquare,
  ChevronDown,
  Building2,
  MapPin
} from 'lucide-react';
import type { AppliedJob, ApplicationStatus } from '../../shared/types/job';

interface JobTableProps {
  jobs: AppliedJob[];
  onUpdateStatus: (jobId: string, status: ApplicationStatus) => void;
  onUpdateNotes: (jobId: string, notes: string) => void;
  onSetFollowUp: (jobId: string, date: string) => void;
  onDelete: (jobId: string) => void;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  screening: { label: 'Screening', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  offer: { label: 'Offer', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  no_response: { label: 'No Response', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
};

const allStatuses: ApplicationStatus[] = [
  'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn', 'no_response'
];

// Dropdown Portal Component
function StatusDropdown({ 

  currentStatus,
  buttonRef, 
  onSelect, 
  onClose 
}: { 

  currentStatus: ApplicationStatus;
  buttonRef: HTMLButtonElement | null;
  onSelect: (status: ApplicationStatus) => void;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [buttonRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          buttonRef && !buttonRef.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [buttonRef, onClose]);

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1"
      style={{ 
        top: position.top, 
        left: position.left,
        zIndex: 9999,
      }}
    >
      {allStatuses.map((s) => (
        <button
          key={s}
          onClick={() => {
            onSelect(s);
            onClose();
          }}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
            currentStatus === s ? 'bg-gray-50 dark:bg-gray-700' : ''
          }`}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${statusConfig[s].color.split(' ')[0]}`}></span>
          {statusConfig[s].label}
        </button>
      ))}
    </div>,
    document.body
  );
}

export function JobTable({
  jobs,
  onUpdateStatus,
  onUpdateNotes,
  onSetFollowUp,
  onDelete,
}: JobTableProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [activeButtonRef, setActiveButtonRef] = useState<HTMLButtonElement | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const handleSaveNotes = (jobId: string) => {
    onUpdateNotes(jobId, notesValue);
    setEditingNotes(null);
  };

  const handleStatusClick = (jobId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (statusDropdown === jobId) {
      setStatusDropdown(null);
      setActiveButtonRef(null);
    } else {
      setStatusDropdown(jobId);
      setActiveButtonRef(e.currentTarget);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <Building2 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No applications yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start applying to jobs and they'll appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Job
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Applied
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Follow Up
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {jobs.map((job) => {
              const status = statusConfig[job.status];
              const isExpanded = expandedJob === job.id;

              return (
                <>
                  <tr 
                    key={job.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Job Info */}
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                          className="mt-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {job.title}
                            </span>
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{job.company}</span>
                            {job.location && (
                              <>
                                <span>•</span>
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{job.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status - FIXED: uses portal dropdown */}
                    <td className="px-4 py-4">
                      <button
                        onClick={(e) => handleStatusClick(job.id, e)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color} hover:opacity-80 transition-opacity`}
                      >
                        {status.label}
                      </button>
                      
                      {statusDropdown === job.id && (
                        <StatusDropdown
                          
                          currentStatus={job.status}
                          buttonRef={activeButtonRef}
                          onSelect={(s) => onUpdateStatus(job.id, s)}
                          onClose={() => {
                            setStatusDropdown(null);
                            setActiveButtonRef(null);
                          }}
                        />
                      )}
                    </td>

                    {/* Applied Date */}
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(job.appliedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getDaysAgo(job.appliedAt)}
                      </div>
                    </td>

                    {/* Follow Up */}
                    <td className="px-4 py-4">
                      <input
                        type="date"
                        value={job.followUpDate?.split('T')[0] || ''}
                        onChange={(e) => onSetFollowUp(job.id, e.target.value)}
                        className="text-sm bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Delete this application record?')) {
                            onDelete(job.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row - Notes */}
                  {isExpanded && (
                    <tr key={`${job.id}-notes`} className="bg-gray-50 dark:bg-gray-900/30">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="ml-8">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                            Notes
                          </label>
                          {editingNotes === job.id ? (
                            <div className="flex gap-2">
                              <textarea
                                value={notesValue}
                                onChange={(e) => setNotesValue(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm resize-none"
                                rows={3}
                                placeholder="Add notes about this application..."
                              />
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleSaveNotes(job.id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingNotes(null)}
                                  className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNotes(job.id);
                                setNotesValue(job.notes || '');
                              }}
                              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-blue-500 min-h-[60px]"
                            >
                              {job.notes || <span className="text-gray-400 italic">Click to add notes...</span>}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
