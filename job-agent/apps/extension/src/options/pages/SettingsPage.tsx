/**
 * SettingsPage - General and Scraping settings
 * OPTIONS-004: Settings management UI (Fixed)
 */

import { useState, useRef } from 'react';
import {
  Settings,
  Target,
  Bell,
  Eye,
  MousePointer,
  Shield,
  Clock,
  Globe,
  Zap,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Check,
  X,
  Loader2,
  Info,
  Plus,
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

export function SettingsPage() {
  const {
    general,
    scraping,
    isLoading,
    isSaving,
    error,
    successMessage,
    updateGeneral,
    resetGeneral,
    updateScraping,
    resetScraping,
    resetAllSettings,
    clearAllData,
    exportSettings,
    importSettings,
  } = useSettings();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importSettings(content);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPlatform = () => {
    if (!newPlatformUrl.trim()) return;
    
    // Extract domain from URL or use as-is
    let domain = newPlatformUrl.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    if (domain && !scraping.enabledPlatforms.includes(domain)) {
      updateScraping({ 
        enabledPlatforms: [...scraping.enabledPlatforms, domain] 
      });
    }
    setNewPlatformUrl('');
  };

  const handleRemovePlatform = (platform: string) => {
    updateScraping({
      enabledPlatforms: scraping.enabledPlatforms.filter(p => p !== platform)
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure Sift behavior and preferences</p>
            </div>
          </div>
        </div>

        {/* Toast Messages */}
        {(error || successMessage) && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            error 
              ? 'bg-red-900/20 border border-red-800 text-red-400' 
              : 'bg-green-900/20 border border-green-800 text-green-400'
          }`}>
            {error ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span className="text-sm">{error || successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* General Settings */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">General Settings</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily goals and behavior</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Daily Goal - Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Application Goal
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={general.dailyGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                          updateGeneral({ dailyGoal: val });
                        }
                      }}
                      className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">applications per day</span>
                  </div>
                </div>

                {/* Toggle Settings */}
                <div className="space-y-2">
                  <ToggleSetting
                    icon={<MousePointer className="w-4 h-4" />}
                    label="Auto-Submit Applications"
                    description="Automatically submit after form is filled"
                    checked={general.autoSubmit}
                    onChange={(checked) => updateGeneral({ autoSubmit: checked })}
                    warning
                  />

                  <ToggleSetting
                    icon={<Shield className="w-4 h-4" />}
                    label="Confirm Before Submit"
                    description="Show confirmation dialog before submitting"
                    checked={general.confirmBeforeSubmit}
                    onChange={(checked) => updateGeneral({ confirmBeforeSubmit: checked })}
                  />

                  <ToggleSetting
                    icon={<Zap className="w-4 h-4" />}
                    label="Auto-Navigate to Next Page"
                    description="Automatically proceed to next form section"
                    checked={general.autoNextPage}
                    onChange={(checked) => updateGeneral({ autoNextPage: checked })}
                  />

                  <ToggleSetting
                    icon={<Bell className="w-4 h-4" />}
                    label="Notification Sound"
                    description="Play sound when actions complete"
                    checked={general.notificationSound}
                    onChange={(checked) => updateGeneral({ notificationSound: checked })}
                  />

                  <ToggleSetting
                    icon={<Eye className="w-4 h-4" />}
                    label="Show Applied Badge"
                    description="Display badge on jobs you've applied to"
                    checked={general.showAppliedBadge}
                    onChange={(checked) => updateGeneral({ showAppliedBadge: checked })}
                  />
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetGeneral}
                  disabled={isSaving}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to defaults
                </button>
              </div>
            </section>

            {/* Scraping Timing Settings */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Scraping Timing</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Limits and delays</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Max Jobs / Session"
                    value={scraping.maxJobsPerSession}
                    min={10}
                    max={500}
                    onChange={(value) => updateScraping({ maxJobsPerSession: value })}
                  />

                  <NumberInput
                    label="Time Filter (Hours)"
                    value={scraping.timeFilterHours}
                    min={1}
                    max={168}
                    onChange={(value) => updateScraping({ timeFilterHours: value })}
                  />

                  <NumberInput
                    label="Min Delay (sec)"
                    value={scraping.requestDelayMin}
                    min={1}
                    max={30}
                    onChange={(value) => updateScraping({ requestDelayMin: value })}
                  />

                  <NumberInput
                    label="Max Delay (sec)"
                    value={scraping.requestDelayMax}
                    min={scraping.requestDelayMin}
                    max={60}
                    onChange={(value) => updateScraping({ requestDelayMax: value })}
                  />
                </div>

                <div className="space-y-2">
                  <ToggleSetting
                    icon={<Zap className="w-4 h-4" />}
                    label="Auto-Start Scraping"
                    description="Begin scraping when extension opens"
                    checked={scraping.autoStartScraping}
                    onChange={(checked) => updateScraping({ autoStartScraping: checked })}
                  />

                  <ToggleSetting
                    icon={<Clock className="w-4 h-4" />}
                    label="Pause on Rate Limit"
                    description="Automatically pause when rate limited"
                    checked={scraping.pauseOnRateLimit}
                    onChange={(checked) => updateScraping({ pauseOnRateLimit: checked })}
                  />
                </div>

                <button
                  onClick={resetScraping}
                  disabled={isSaving}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to defaults
                </button>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Enabled Platforms */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-500" />
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">Enabled Platforms</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {scraping.enabledPlatforms.length} platforms enabled
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Add New Platform */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newPlatformUrl}
                    onChange={(e) => setNewPlatformUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlatform()}
                    placeholder="Add domain (e.g., greenhouse.io)"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddPlatform}
                    disabled={!newPlatformUrl.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Platform List */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {scraping.enabledPlatforms.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No platforms enabled. Add one above.
                    </p>
                  ) : (
                    scraping.enabledPlatforms.map((platform) => (
                      <div
                        key={platform}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{platform}</span>
                        </div>
                        <button
                          onClick={() => handleRemovePlatform(platform)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Import/Export */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-purple-500" />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Import / Export</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Backup or restore settings</p>
                  </div>
                </div>
              </div>

              <div className="p-5 flex gap-3">
                <button
                  onClick={exportSettings}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-red-300 dark:border-red-900/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-200 dark:border-red-900/50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Irreversible actions</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {/* Reset All Settings */}
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All Settings
                  </button>
                ) : (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">Reset all settings to defaults?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          resetAllSettings();
                          setShowResetConfirm(false);
                        }}
                        disabled={isSaving}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Resetting...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Clear All Data */}
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                ) : (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Delete ALL profiles, jobs & settings?
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          clearAllData();
                          setShowClearConfirm(false);
                        }}
                        disabled={isSaving}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Deleting...' : 'Delete All'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
          Sift v0.8.4 • Settings v2
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface ToggleSettingProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  warning?: boolean;
}

function ToggleSetting({ icon, label, description, checked, onChange, warning }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`${warning && checked ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
            {warning && checked && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
                Caution
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-10 h-5 rounded-full transition-colors flex-shrink-0
          ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function NumberInput({ label, value, min, max, onChange }: NumberInputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val) && val >= min && val <= max) {
            onChange(val);
          }
        }}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
