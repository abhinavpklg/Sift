/**
 * useJobs - Hook for job history management
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  AppliedJob, 
  ScrapedJob,
  ApplicationStatus, 
  AppliedJobFilter,
  JobStats 
} from '../../shared/types/job';
import { JobStorage } from '../../shared/storage/JobStorage';

interface UseJobsReturn {
  // Data
  appliedJobs: AppliedJob[];
  scrapedJobs: ScrapedJob[];
  stats: JobStats | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filter: AppliedJobFilter;
  setFilter: (filter: AppliedJobFilter) => void;
  
  // Actions
  updateStatus: (jobId: string, status: ApplicationStatus) => Promise<void>;
  updateNotes: (jobId: string, notes: string) => Promise<void>;
  setFollowUp: (jobId: string, date: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  exportCsv: () => Promise<void>;
  exportJson: () => Promise<void>;
  refresh: () => Promise<void>;
}


export function useJobs(): UseJobsReturn {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppliedJobFilter>({});

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [applied, scraped, jobStats] = await Promise.all([
        Object.keys(filter).length > 0 
          ? JobStorage.getFilteredAppliedJobs(filter)
          : JobStorage.getAppliedJobs(),
        JobStorage.getScrapedJobs(),
        JobStorage.getStats(),
      ]);

      setAppliedJobs(applied);
      setScrapedJobs(scraped);
      setStats(jobStats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = async (jobId: string, status: ApplicationStatus) => {
    await JobStorage.updateApplicationStatus(jobId, status);
    await loadData();
  };

  const updateNotes = async (jobId: string, notes: string) => {
    await JobStorage.updateAppliedJobNotes(jobId, notes);
    await loadData();
  };

  const setFollowUp = async (jobId: string, date: string) => {
    await JobStorage.setFollowUpDate(jobId, date);
    await loadData();
  };

  const deleteJob = async (jobId: string) => {
    await JobStorage.deleteAppliedJob(jobId);
    await loadData();
  };

  const exportCsv = async () => {
    const csv = await JobStorage.exportAppliedJobsAsCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sift-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = async () => {
    const json = await JobStorage.exportAppliedJobs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sift-jobs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    appliedJobs,
    scrapedJobs,
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
    refresh: loadData,
  };
}

export default useJobs;
