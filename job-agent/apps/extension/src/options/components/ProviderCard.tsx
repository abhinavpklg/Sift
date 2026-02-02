/**
 * ProviderCard - Card for selecting an LLM provider
 * UPDATED: Support for custom providers
 */

import { Check, Zap, DollarSign, Server, Wrench } from 'lucide-react';
import type { LLMProvider, ProviderInfo } from '../../shared/llm/types';

interface ProviderCardProps {
  provider: ProviderInfo;
  isSelected: boolean;
  onSelect: (providerId: string) => void;
}

const providerIcons: Record<string, string> = {
  ollama: '🦙',
  openai: '🤖',
  anthropic: '🧠',
  gemini: '✨',
  openrouter: '🔀',
  groq: '⚡',
};

export function ProviderCard({ provider, isSelected, onSelect }: ProviderCardProps) {
  const icon = providerIcons[provider.id as LLMProvider] || '🔧';

  return (
    <button
      onClick={() => onSelect(provider.id)}
      className={`
        relative p-4 rounded-xl border-2 text-left transition-all w-full
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {provider.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {provider.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {provider.isCustom && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full">
            <Wrench className="w-3 h-3" />
            Custom
          </span>
        )}
        {provider.freetier && !provider.isCustom && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
            <DollarSign className="w-3 h-3" />
            Free
          </span>
        )}
        {!provider.requiresApiKey && !provider.isCustom && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
            <Server className="w-3 h-3" />
            Local
          </span>
        )}
        {provider.id === 'groq' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
            <Zap className="w-3 h-3" />
            Fast
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {provider.models.length} model{provider.models.length !== 1 ? 's' : ''}
      </p>
    </button>
  );
}
