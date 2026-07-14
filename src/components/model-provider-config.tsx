/**
 * ModelProviderConfig — Reusable model provider configuration component
 * 
 * Renders the provider selector, model picker, and provider-specific fields
 * based on the model-providers registry. Used by both agent and orchestrator-agent
 * property panels to eliminate duplication.
 */

import {
  MODEL_PROVIDERS,
  getProvider,
  getDefaultModel,
  getOfficialProviders,
  getCommunityProviders,
  migrateProviderName,
  type ModelProvider,
} from '../lib/model-providers';

interface ModelProviderConfigProps {
  data: any;
  onUpdate: (updates: Record<string, any>) => void;
  /** Whether to show the streaming toggle */
  showStreaming?: boolean;
  /** Whether streaming is available (output node connected) */
  streamingAvailable?: boolean;
}

export function ModelProviderConfig({
  data,
  onUpdate,
  showStreaming = true,
  streamingAvailable = true,
}: ModelProviderConfigProps) {
  // Migrate old provider names to new IDs
  const currentProviderId = migrateProviderName(data.modelProvider || 'bedrock');
  const provider = getProvider(currentProviderId);

  const officialProviders = getOfficialProviders();
  const communityProviders = getCommunityProviders();

  const handleProviderChange = (newProviderId: string) => {
    const newProvider = getProvider(newProviderId);
    if (!newProvider) return;

    const defaultModel = getDefaultModel(newProviderId);
    const updates: Record<string, any> = {
      modelProvider: newProviderId,
      modelId: defaultModel?.model_id || '',
      modelName: defaultModel?.model_name || '',
      // Reset provider-specific fields
      apiKey: '',
      baseUrl: '',
      host: '',
      endpointName: '',
      region: '',
    };

    onUpdate(updates);
  };

  const handleFieldChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  const handleModelChange = (modelId: string) => {
    if (provider?.models) {
      const selected = provider.models.find(m => m.model_id === modelId);
      if (selected) {
        onUpdate({ modelId: selected.model_id, modelName: selected.model_name });
      }
    } else {
      onUpdate({ modelId: modelId, modelName: modelId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Provider
        </label>
        <select
          value={currentProviderId}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <optgroup label="Official Providers">
            {officialProviders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Community Providers">
            {communityProviders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        </select>
        {provider && (
          <p className="text-xs text-gray-500 mt-1">{provider.description}</p>
        )}
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        {provider?.modelSelection === 'dropdown' && provider.models ? (
          <select
            value={data.modelId || provider.models[0]?.model_id || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {provider.models.map((model) => (
              <option key={model.model_id} value={model.model_id}>
                {model.model_name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={data.modelName || data.modelId || ''}
            onChange={(e) => {
              onUpdate({ modelName: e.target.value, modelId: e.target.value });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder={getModelPlaceholder(currentProviderId)}
          />
        )}
      </div>

      {/* Provider-Specific Fields */}
      {provider?.fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={data[field.key] || field.defaultValue || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={data[field.key] || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={field.placeholder}
            />
          )}
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      ))}

      {/* System Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt
        </label>
        <textarea
          value={data.systemPrompt || ''}
          onChange={(e) => handleFieldChange('systemPrompt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="You are a helpful AI assistant..."
          rows={4}
        />
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Temperature: {getTemperatureDisplay(data, provider)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isTemperatureLocked(data, provider) ? 1 : (data.temperature || 0.7)}
          onChange={(e) => {
            if (!isTemperatureLocked(data, provider)) {
              handleFieldChange('temperature', parseFloat(e.target.value));
            }
          }}
          disabled={isTemperatureLocked(data, provider)}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isTemperatureLocked(data, provider) && (
          <p className="text-xs text-amber-600 mt-1">
            Temperature is locked to 1.0 when thinking is enabled
          </p>
        )}
      </div>

      {/* Max Tokens */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Tokens
        </label>
        <input
          type="number"
          value={data.maxTokens || 10000}
          onChange={(e) => handleFieldChange('maxTokens', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          min="1"
          max="200000"
        />
      </div>

      {/* Streaming Toggle */}
      {showStreaming && (
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.streaming || false}
              disabled={!streamingAvailable}
              onChange={(e) => handleFieldChange('streaming', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700">Enable Streaming</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            {streamingAvailable
              ? "Stream responses in real-time for better user experience"
              : "Connect an Output node to enable streaming mode"
            }
          </p>
        </div>
      )}

      {/* Advanced: Thinking/Reasoning */}
      {provider?.supportsThinking && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-3">Advanced Settings</h4>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.thinkingEnabled || false}
                onChange={(e) => handleFieldChange('thinkingEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Thinking</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable extended thinking for more complex reasoning
            </p>
          </div>

          {data.thinkingEnabled && provider.thinkingConfig === 'budget_tokens' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thinking Budget Tokens: {data.thinkingBudgetTokens || 2048}
              </label>
              <input
                type="range"
                min="1024"
                max="8192"
                step="512"
                value={data.thinkingBudgetTokens || 2048}
                onChange={(e) => handleFieldChange('thinkingBudgetTokens', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1,024</span>
                <span>8,192</span>
              </div>
            </div>
          )}

          {data.thinkingEnabled && provider.thinkingConfig === 'reasoning_effort' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reasoning Effort
              </label>
              <select
                value={data.reasoningEffort || 'medium'}
                onChange={(e) => handleFieldChange('reasoningEffort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Helper functions ---

function getModelPlaceholder(providerId: string): string {
  const placeholders: Record<string, string> = {
    openai: 'gpt-4o, gpt-4o-mini, o3-mini',
    openai_responses: 'gpt-4o, gpt-4.1',
    ollama: 'llama3.3, qwen2.5, deepseek-r1',
    litellm: 'openai/gpt-4o, anthropic/claude-3, together_ai/...',
    llamaapi: 'llama3.3-70b, llama3.1-405b',
    llamacpp: 'Model name (auto-detected from server)',
    sagemaker: 'Endpoint model identifier',
    writer: 'palmyra-x-004, palmyra-creative',
    custom: 'Model ID (provider-specific)',
    nvidia_nim: 'meta/llama-3.3-70b-instruct',
    cohere: 'command-r-plus, command-r',
    xai: 'grok-2, grok-beta',
  };
  return placeholders[providerId] || 'Enter model name';
}

function isTemperatureLocked(data: any, provider: ModelProvider | undefined): boolean {
  if (!provider?.supportsThinking) return false;
  if (!data.thinkingEnabled) return false;
  // Bedrock and Anthropic lock temperature to 1.0 when thinking is enabled
  return provider.thinkingConfig === 'budget_tokens';
}

function getTemperatureDisplay(data: any, provider: ModelProvider | undefined): number {
  if (isTemperatureLocked(data, provider)) return 1;
  return data.temperature || 0.7;
}
