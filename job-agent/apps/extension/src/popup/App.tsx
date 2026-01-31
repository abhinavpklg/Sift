import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Settings, 
  User, 
  Zap, 
  ExternalLink,
  Wifi,
  WifiOff,
  Target,
  TrendingUp
} from 'lucide-react';

interface Stats {
  appliedToday: number;
  dailyGoal: number;
  totalApplied: number;
}

interface Profile {
  id: string;
  name: string;
  isActive: boolean;
}

export default function App() {
  const [stats, setStats] = useState<Stats>({ appliedToday: 0, dailyGoal: 10, totalApplied: 0 });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [llmConnected, setLlmConnected] = useState<boolean>(false);
  const [isScrapingActive, setIsScrapingActive] = useState(false);

  useEffect(() => {
    // Load initial data
    loadStats();
    loadProfiles();
    checkLLMConnection();
  }, []);

  const loadStats = async () => {
    try {
      const result = await chrome.storage.local.get(['stats']);
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const result = await chrome.storage.local.get(['profiles', 'activeProfileId']);
      if (result.profiles) {
        setProfiles(result.profiles);
        const active = result.profiles.find((p: Profile) => p.id === result.activeProfileId);
        setActiveProfile(active || null);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const checkLLMConnection = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      setLlmConnected(response.ok);
    } catch {
      setLlmConnected(false);
    }
  };

  const handleFillForm = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM' });
      window.close();
    }
  };

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const progressPercent = Math.min((stats.appliedToday / stats.dailyGoal) * 100, 100);

  return (
    <div className="w-popup h-popup flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Job Agent</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered applications</p>
          </div>
        </div>
        <button 
          onClick={handleOpenOptions}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </header>

      {/* Stats Card */}
      <div className="p-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Today's Progress</span>
            </div>
            <span className="text-xs text-gray-500">{stats.appliedToday} / {stats.dailyGoal}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>Total: {stats.totalApplied}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Selector */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <select 
            className="input text-sm py-1"
            value={activeProfile?.id || ''}
            onChange={(e) => {
              const profile = profiles.find(p => p.id === e.target.value);
              setActiveProfile(profile || null);
              chrome.storage.local.set({ activeProfileId: e.target.value });
            }}
          >
            <option value="">Select Profile</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-1 p-4 space-y-2">
        <button
          onClick={handleFillForm}
          disabled={!activeProfile}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" />
          Fill Current Form
        </button>

        <button
          onClick={() => setIsScrapingActive(!isScrapingActive)}
          className={`btn w-full flex items-center justify-center gap-2 ${
            isScrapingActive 
              ? 'bg-error text-white hover:bg-red-600' 
              : 'btn-secondary'
          }`}
        >
          {isScrapingActive ? 'Stop Scraping' : 'Start Job Search'}
        </button>

        <button
          onClick={handleOpenOptions}
          className="btn-ghost w-full flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open Dashboard
        </button>
      </div>

      {/* Footer - LLM Status */}
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {llmConnected ? (
              <>
                <Wifi className="w-4 h-4 text-success" />
                <span className="text-success">Ollama Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-error" />
                <span className="text-error">Ollama Offline</span>
              </>
            )}
          </div>
          <button 
            onClick={checkLLMConnection}
            className="text-xs text-primary-600 hover:underline"
          >
            Refresh
          </button>
        </div>
      </footer>
    </div>
  );
}
