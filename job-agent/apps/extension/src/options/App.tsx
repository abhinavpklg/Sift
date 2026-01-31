import React from 'react';
import { 
  Briefcase, 
  User, 
  Settings, 
  History, 
  Search,
  Cpu
} from 'lucide-react';

type Page = 'profile' | 'jobs' | 'history' | 'settings' | 'llm';

export default function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('profile');

  const navItems = [
    { id: 'profile' as Page, icon: User, label: 'Profile' },
    { id: 'jobs' as Page, icon: Search, label: 'Job Queue' },
    { id: 'history' as Page, icon: History, label: 'History' },
    { id: 'llm' as Page, icon: Cpu, label: 'LLM Config' },
    { id: 'settings' as Page, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">Job Agent</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            AI Job Agent v0.1.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          {currentPage === 'profile' && <ProfilePlaceholder />}
          {currentPage === 'jobs' && <JobsPlaceholder />}
          {currentPage === 'history' && <HistoryPlaceholder />}
          {currentPage === 'llm' && <LLMPlaceholder />}
          {currentPage === 'settings' && <SettingsPlaceholder />}
        </div>
      </main>
    </div>
  );
}

// Placeholder components - will be replaced in later tasks
function ProfilePlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Management</h2>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Profile editor will be implemented in OPTIONS-002.
        </p>
      </div>
    </div>
  );
}

function JobsPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Job Queue</h2>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Job queue will be implemented in OPTIONS-004.
        </p>
      </div>
    </div>
  );
}

function HistoryPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Application History</h2>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          History page will be implemented in OPTIONS-005.
        </p>
      </div>
    </div>
  );
}

function LLMPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">LLM Configuration</h2>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          LLM configuration will be implemented in OPTIONS-006.
        </p>
      </div>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Settings page will be implemented in OPTIONS-003.
        </p>
      </div>
    </div>
  );
}
