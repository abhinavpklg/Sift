/**
 * AIConfigPage - LLM provider configuration
 * UPDATED: Custom provider support
 */

import { useState } from 'react';
import { 
  Cpu, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  EyeOff,
  RotateCcw,
  Sliders,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { useAIConfig } from '../hooks/useAIConfig';
import { ProviderCard } from '../components/ProviderCard';
import { CustomProviderModal } from '../components/CustomProviderModal';
import { PROVIDER_INFO } from '../../shared/llm/types';
import type { CustomProvider } from '../../shared/llm/types';

export function AIConfigPage() {
  const {
    config,
    customProviders,
    allProviders,
    isLoading,
    error,
    isTesting,
    testResult,
    setProvider,
    setModel,
    setApiKey,
    setEndpoint,
    updateConfig,
    testConnection,
    resetToDefaults,
    addCustomProvider,
    updateCustomProvider,
    deleteCustomProvider,
  } = useAIConfig();

  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CustomProvider | undefined>();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading AI configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Failed to load configuration'}</p>
        </div>
      </div>
    );
  }

  // Get current provider info
  const currentProviderId = config.provider === 'custom' ? config.customProviderId : config.provider;
  const currentProvider = allProviders.find(p => p.id === currentProviderId) || PROVIDER_INFO.ollama;
  const isCustomProvider = currentProvider.isCustom;

  const handleSaveCustomProvider = async (data: Omit<CustomProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProvider) {
      await updateCustomProvider(editingProvider.id, data);
    } else {
      const newProvider = await addCustomProvider(data);
      await setProvider(newProvider.id);
    }
    setShowCustomModal(false);
    setEditingProvider(undefined);
  };

  const handleEditCustomProvider = (provider: CustomProvider) => {
    setEditingProvider(provider);
    setShowCustomModal(true);
  };

  const handleDeleteCustomProvider = async (id: string) => {
    if (confirm('Delete this custom provider?')) {
      await deleteCustomProvider(id);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Configuration
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure your LLM provider for generating responses
            </p>
          </div>
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Provider Selection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Provider
            </h2>
            <button
              onClick={() => { setEditingProvider(undefined); setShowCustomModal(true); }}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Custom
            </button>
          </div>
          
          {/* Built-in Providers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Object.values(PROVIDER_INFO).map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={currentProviderId === provider.id}
                onSelect={setProvider}
              />
            ))}
          </div>

          {/* Custom Providers */}
          {customProviders.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Custom Providers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {customProviders.map((cp) => {
                  const providerInfo = allProviders.find(p => p.id === cp.id)!;
                  return (
                    <div key={cp.id} className="relative group">
                      <ProviderCard
                        provider={providerInfo}
                        isSelected={currentProviderId === cp.id}
                        onSelect={setProvider}
                      />
                      {/* Edit/Delete buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditCustomProvider(cp); }}
                          className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Pencil className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCustomProvider(cp.id); }}
                          className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              {currentProvider.name} Configuration
            </h2>

            <div className="space-y-4">
              {/* API Key */}
              {currentProvider.requiresApiKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={config.apiKey || ''}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter your ${currentProvider.name} API key`}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Stored locally, never sent to our servers</p>
                </div>
              )}

              {/* Endpoint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endpoint
                </label>
                <input
                  type="url"
                  value={config.endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                {isCustomProvider ? (
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Enter model name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                ) : (
                  <select
                    value={config.model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {currentProvider.models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({Math.round(model.contextWindow / 1000)}K)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Advanced Settings */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Sliders className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} advanced settings
              </button>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) || 1024 })}
                      min={100}
                      max={4096}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Temperature ({config.temperature})
                    </label>
                    <input
                      type="range"
                      value={config.temperature}
                      onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                      min={0}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.timeout / 1000}
                      onChange={(e) => updateConfig({ timeout: (parseInt(e.target.value) || 30) * 1000 })}
                      min={5}
                      max={120}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Test Connection */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Connection
            </h2>

            <button
              onClick={testConnection}
              disabled={isTesting || (currentProvider.requiresApiKey && !config.apiKey)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5" />
                  Test Connection
                </>
              )}
            </button>

            {testResult && (
              <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                testResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {testResult.success ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
                <div>
                  <p className="font-medium">{testResult.success ? 'Connected!' : 'Failed'}</p>
                  <p className="text-sm opacity-80">{testResult.message}</p>
                  {testResult.latencyMs && <p className="text-xs opacity-60 mt-1">{testResult.latencyMs}ms</p>}
                </div>
              </div>
            )}

            {currentProvider.requiresApiKey && !config.apiKey && (
              <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Enter an API key first
              </p>
            )}

            {/* Tips */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Tips</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {config.provider === 'ollama' && 'Run `ollama serve` to start the local server.'}
                {config.provider === 'custom' && 'Custom providers should be OpenAI-compatible.'}
                {!['ollama', 'custom'].includes(config.provider) && `Get your API key from the ${currentProvider.name} dashboard.`}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Custom Provider Modal */}
      {showCustomModal && (
        <CustomProviderModal
          provider={editingProvider}
          onSave={handleSaveCustomProvider}
          onClose={() => { setShowCustomModal(false); setEditingProvider(undefined); }}
        />
      )}
    </div>
  );
}
