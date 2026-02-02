/**
 * CustomProviderModal - Modal for adding/editing custom providers
 */

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { CustomProvider, ModelInfo } from '../../shared/llm/types';

interface CustomProviderModalProps {
  provider?: CustomProvider;
  onSave: (provider: Omit<CustomProvider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function CustomProviderModal({ provider, onSave, onClose }: CustomProviderModalProps) {
  const [name, setName] = useState(provider?.name || '');
  const [description, setDescription] = useState(provider?.description || '');
  const [endpoint, setEndpoint] = useState(provider?.endpoint || '');
  const [apiKeyRequired, setApiKeyRequired] = useState(provider?.apiKeyRequired ?? true);
  const [models, setModels] = useState<ModelInfo[]>(
    provider?.models || [{ id: '', name: '', contextWindow: 4096 }]
  );

  const handleAddModel = () => {
    setModels([...models, { id: '', name: '', contextWindow: 4096 }]);
  };

  const handleRemoveModel = (index: number) => {
    if (models.length > 1) {
      setModels(models.filter((_, i) => i !== index));
    }
  };

  const handleModelChange = (index: number, field: keyof ModelInfo, value: string | number) => {
    const updated = [...models];
    updated[index] = { ...updated[index], [field]: value };
    setModels(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !endpoint.trim() || models.some(m => !m.id.trim() || !m.name.trim())) {
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      endpoint: endpoint.trim(),
      apiKeyRequired,
      models: models.filter(m => m.id.trim() && m.name.trim()),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {provider ? 'Edit Custom Provider' : 'Add Custom Provider'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Local LLM"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Self-hosted vLLM server"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Endpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Endpoint <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Should be OpenAI-compatible (supports /models and /chat/completions)
            </p>
          </div>

          {/* API Key Required */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="apiKeyRequired"
              checked={apiKeyRequired}
              onChange={(e) => setApiKeyRequired(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="apiKeyRequired" className="text-sm text-gray-700 dark:text-gray-300">
              Requires API key
            </label>
          </div>

          {/* Models */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Models <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddModel}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Model
              </button>
            </div>
            
            <div className="space-y-3">
              {models.map((model, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={model.id}
                      onChange={(e) => handleModelChange(index, 'id', e.target.value)}
                      placeholder="Model ID"
                      className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      required
                    />
                    <input
                      type="text"
                      value={model.name}
                      onChange={(e) => handleModelChange(index, 'name', e.target.value)}
                      placeholder="Display Name"
                      className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      required
                    />
                    <input
                      type="number"
                      value={model.contextWindow}
                      onChange={(e) => handleModelChange(index, 'contextWindow', parseInt(e.target.value) || 4096)}
                      placeholder="Context Window"
                      className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm col-span-2"
                      min={1}
                    />
                  </div>
                  {models.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModel(index)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {provider ? 'Save Changes' : 'Add Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
