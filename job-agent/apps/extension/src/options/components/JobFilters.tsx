/**
 * JobFilters - Filter controls for job history
 * FIXED: showFilters controlled by parent to prevent collapse
 */

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import type { AppliedJobFilter, ApplicationStatus } from '../../shared/types/job';

interface JobFiltersProps {
  filter: AppliedJobFilter;
  onFilterChange: (filter: AppliedJobFilter) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  totalJobs: number;
  filteredCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  { value: 'no_response', label: 'No Response', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
];

export function JobFilters({
  filter,
  onFilterChange,
  onExportCsv,
  onExportJson,
  totalJobs,
  filteredCount,
  showFilters,
  onToggleFilters,
}: JobFiltersProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilter = (key: keyof AppliedJobFilter, value: AppliedJobFilter[keyof AppliedJobFilter]) => {
    const newFilter = { ...filter };
    if (value === undefined || value === '') {
      delete newFilter[key];
    } else {
      (newFilter as Record<string, unknown>)[key] = value;
    }
    onFilterChange(newFilter);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filter.status || filter.dateFrom || filter.dateTo || filter.searchQuery;

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or notes..."
            value={filter.searchQuery || ''}
            onChange={(e) => updateFilter('searchQuery', e.target.value || undefined)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>

        {/* Filter Toggle - FIXED: uses parent state */}
        <button
          onClick={onToggleFilters}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
            hasActiveFilters || showFilters
              ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={() => { onExportCsv(); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Export as CSV
              </button>
              <button
                onClick={() => { onExportJson(); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Export as JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => {
                const isSelected = filter.status === status.value;

                return (
                  <button
                    key={status.value}
                    onClick={() => {
                      updateFilter('status', isSelected ? undefined : status.value);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? status.color + ' ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filter.dateFrom?.split('T')[0] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilter('dateFrom', value ? new Date(value).toISOString() : undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filter.dateTo?.split('T')[0] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilter('dateTo', value ? new Date(value).toISOString() : undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredCount} of {totalJobs} applications
      </div>
    </div>
  );
}
