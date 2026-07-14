/**
 * ADK Agent Configuration Panel
 * 
 * Main config for LlmAgent: name, model, instruction, output_key, generate_content_config.
 */

import { useState } from 'react';
import { Bot, Settings } from 'lucide-react';

interface ADKAgentConfigProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
}

export function ADKAgentConfig({ data, onUpdate }: ADKAgentConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3">
      {/* Name (required) */}
      <div>
        <label className="text-[11px] font-medium text-slate-700 block mb-1">Agent Name *</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="my_agent"
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
        />
        <p className="text-[10px] text-slate-400 mt-0.5">Unique identifier (Python variable name)</p>
      </div>

      {/* Model */}
      <div>
        <label className="text-[11px] font-medium text-slate-700 block mb-1">Model</label>
        <select
          value={data.model || 'gemini-2.0-flash'}
          onChange={(e) => onUpdate({ model: e.target.value })}
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
        >
          <optgroup label="Gemini">
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </optgroup>
          <optgroup label="Via LiteLLM">
            <option value="litellm:openai/gpt-4o">OpenAI GPT-4o</option>
            <option value="litellm:anthropic/claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="litellm:ollama/llama3.1">Ollama Llama 3.1</option>
            <option value="litellm:mistral/mistral-large-latest">Mistral Large</option>
          </optgroup>
        </select>
      </div>

      {/* Instruction */}
      <div>
        <label className="text-[11px] font-medium text-slate-700 block mb-1">Instruction</label>
        <textarea
          value={data.instruction || ''}
          onChange={(e) => onUpdate({ instruction: e.target.value })}
          placeholder="You are a helpful assistant that..."
          rows={4}
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-400 resize-y font-mono"
        />
        <p className="text-[10px] text-slate-400 mt-0.5">Supports {'{'}'state_key'{'}'} templating from session state</p>
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-medium text-slate-700 block mb-1">Description</label>
        <input
          type="text"
          value={data.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Used for routing in multi-agent setups"
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
        />
      </div>

      {/* Output Key */}
      <div>
        <label className="text-[11px] font-medium text-slate-700 block mb-1">Output Key</label>
        <input
          type="text"
          value={data.outputKey || ''}
          onChange={(e) => onUpdate({ outputKey: e.target.value })}
          placeholder="e.g. last_response"
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
        />
        <p className="text-[10px] text-slate-400 mt-0.5">Saves agent output to session.state[key]</p>
      </div>

      {/* Advanced: GenerateContentConfig */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
      >
        <Settings size={12} />
        {showAdvanced ? 'Hide' : 'Show'} Generation Config
      </button>

      {showAdvanced && (
        <div className="space-y-2 pl-3 border-l-2 border-indigo-100">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-600 block">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={data.temperature ?? 0.7}
                onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 block">Max Output Tokens</label>
              <input
                type="number"
                value={data.maxOutputTokens ?? 1024}
                onChange={(e) => onUpdate({ maxOutputTokens: parseInt(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 block">Top P</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={data.topP ?? 0.95}
                onChange={(e) => onUpdate({ topP: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 block">Top K</label>
              <input
                type="number"
                min="1"
                max="100"
                value={data.topK ?? 40}
                onChange={(e) => onUpdate({ topK: parseInt(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
