/**
 * Options App - Main entry point
 * Updated: Added Settings page (OPTIONS-004)
 */

import { useState } from 'react';
import { 
  User, 
  History, 
  Cpu, 
  Settings
} from 'lucide-react';
import { ProfilePage } from './pages/ProfilePage';
import { JobHistoryPage } from './pages/JobHistoryPage';
import { AIConfigPage } from './pages/AIConfigPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';

type Page = 'profile' | 'history' | 'ai' | 'settings';

const navigation: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'history', label: 'History', icon: History },
  { id: 'ai', label: 'AI Config', icon: Cpu },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [activePage, setActivePage] = useState<Page>('profile');
  const { theme, toggleTheme, isLoaded } = useTheme();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-48 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">Sift</h1>
              <p className="text-[10px] text-gray-500">Sift smarter. Apply faster.</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Sift v0.8.4</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden">
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'history' && <JobHistoryPage />}
        {activePage === 'ai' && <AIConfigPage />}
        {activePage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
