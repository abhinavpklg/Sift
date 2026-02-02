/**
 * JobHistoryPage - Application history and stats
 * FIXED: Filter panel state managed here to prevent collapse
 */

import { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import { JobStatsCards } from '../components/JobStatsCards';
import { JobFilters } from '../components/JobFilters';
import { JobTable } from '../components/JobTable';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function JobHistoryPage() {
  const {
    appliedJobs,
    stats,
    isLoading,
    error,
    filter,
    setFilter,
    updateStatus,
    updateNotes,
    setFollowUp,
    deleteJob,
    exportCsv,
    exportJson,
    refresh,
  } = useJobs();

  // FIXED: Manage filter panel visibility at page level
  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading job history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Application History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your job applications and their progress
            </p>
          </div>
          <button
            onClick={refresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        {stats && <JobStatsCards stats={stats} dailyGoal={10} />}

        {/* Filters - pass showFilters state from parent */}
        <JobFilters
          filter={filter}
          onFilterChange={setFilter}
          onExportCsv={exportCsv}
          onExportJson={exportJson}
          totalJobs={stats?.applied || 0}
          filteredCount={appliedJobs.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Job Table */}
        <JobTable
          jobs={appliedJobs}
          onUpdateStatus={updateStatus}
          onUpdateNotes={updateNotes}
          onSetFollowUp={setFollowUp}
          onDelete={deleteJob}
        />
      </div>
    </div>
  );
}
