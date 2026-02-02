/**
 * JobStatsCards - Dashboard stats cards
 */

import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Calendar,
  TrendingUp,
  Target
} from 'lucide-react';
import type { JobStats } from '../../shared/types/job';

interface JobStatsCardsProps {
  stats: JobStats;
  dailyGoal?: number;
}

export function JobStatsCards({ stats, dailyGoal = 10 }: JobStatsCardsProps) {
  const goalProgress = Math.min((stats.todayApplied / dailyGoal) * 100, 100);

  const cards = [
    {
      label: 'Today',
      value: stats.todayApplied,
      subtext: `Goal: ${dailyGoal}`,
      icon: Target,
      color: 'blue',
      progress: goalProgress,
    },
    {
      label: 'This Week',
      value: stats.thisWeekApplied,
      subtext: 'Applications',
      icon: Calendar,
      color: 'purple',
    },
    {
      label: 'Total Applied',
      value: stats.applied,
      subtext: 'All time',
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'In Queue',
      value: stats.pending,
      subtext: 'Pending review',
      icon: Clock,
      color: 'yellow',
    },
    {
      label: 'Saved',
      value: stats.saved,
      subtext: 'For later',
      icon: Briefcase,
      color: 'indigo',
    },
    {
      label: 'Total Jobs',
      value: stats.total,
      subtext: 'Scraped',
      icon: TrendingUp,
      color: 'gray',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { 
      bg: 'bg-blue-50 dark:bg-blue-900/20', 
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-600 dark:text-blue-400'
    },
    purple: { 
      bg: 'bg-purple-50 dark:bg-purple-900/20', 
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400'
    },
    green: { 
      bg: 'bg-green-50 dark:bg-green-900/20', 
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-600 dark:text-green-400'
    },
    yellow: { 
      bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-600 dark:text-yellow-400'
    },
    indigo: { 
      bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
      icon: 'text-indigo-600 dark:text-indigo-400',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    gray: { 
      bg: 'bg-gray-50 dark:bg-gray-800', 
      icon: 'text-gray-600 dark:text-gray-400',
      text: 'text-gray-600 dark:text-gray-400'
    },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = colorClasses[card.color];

        return (
          <div
            key={card.label}
            className={`${colors.bg} rounded-xl p-4 transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${colors.icon}`} />
              {card.progress !== undefined && (
                <span className={`text-xs font-medium ${colors.text}`}>
                  {Math.round(card.progress)}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {card.label}
            </div>
            {card.progress !== undefined && (
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
