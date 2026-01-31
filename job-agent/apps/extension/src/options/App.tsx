import { useState } from 'react';
import { 
  Search, 
  User, 
  Settings, 
  History, 
  Briefcase,
  Cpu
} from 'lucide-react';

type Page = 'profile' | 'jobs' | 'history' | 'settings' | 'llm';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('profile');

  const navItems = [
    { id: 'profile' as Page, icon: User, label: 'Profile' },
    { id: 'jobs' as Page, icon: Briefcase, label: 'Job Queue' },
    { id: 'history' as Page, icon: History, label: 'History' },
    { id: 'llm' as Page, icon: Cpu, label: 'AI Config' },
    { id: 'settings' as Page, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">Sift</h1>
              <p className="text-xs text-gray-500">Sift smarter. Apply faster.</p>
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
            Sift v0.1.0
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

function ProfilePlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Management</h2>
      <p className="text-gray-500 mb-6">Manage your job application profiles</p>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Profile editor coming soon...
        </p>
      </div>
    </div>
  );
}

function JobsPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Queue</h2>
      <p className="text-gray-500 mb-6">Jobs sifted and ready to apply</p>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Job queue coming soon...
        </p>
      </div>
    </div>
  );
}

function HistoryPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application History</h2>
      <p className="text-gray-500 mb-6">Track your job applications</p>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          History coming soon...
        </p>
      </div>
    </div>
  );
}

function LLMPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Configuration</h2>
      <p className="text-gray-500 mb-6">Configure your local or cloud AI</p>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          AI configuration coming soon...
        </p>
      </div>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
      <p className="text-gray-500 mb-6">Customize your Sift experience</p>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Settings coming soon...
        </p>
      </div>
    </div>
  );
}
