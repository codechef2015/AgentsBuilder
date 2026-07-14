/**
 * ADK Session Configuration Panel
 * 
 * Configures session service type and state management.
 */

import { Database } from 'lucide-react';

interface ADKSessionConfigProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
}

const SESSION_TYPES = [
  {
    id: 'in-memory',
    name: 'InMemorySessionService',
    description: 'No persistence. Ideal for development and testing.',
    fields: [],
  },
  {
    id: 'database',
    name: 'DatabaseSessionService',
    description: 'Persists to SQLite, PostgreSQL, or MySQL via async SQLAlchemy.',
    fields: [
      { key: 'dbUrl', label: 'Database URL', placeholder: 'sqlite+aiosqlite:///./sessions.db', required: true },
    ],
  },
  {
    id: 'vertex-ai',
    name: 'VertexAiSessionService',
    description: 'Google Cloud managed session storage.',
    fields: [
      { key: 'gcpProject', label: 'GCP Project ID', placeholder: 'my-project-id', required: true },
      { key: 'gcpLocation', label: 'Location', placeholder: 'us-central1', required: true },
    ],
  },
];

export function ADKSessionConfig({ data, onUpdate }: ADKSessionConfigProps) {
  const activeType = SESSION_TYPES.find(s => s.id === (data.sessionType || 'in-memory')) || SESSION_TYPES[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Database size={14} className="text-violet-500" />
        <span className="text-[11px] font-semibold text-slate-700">Session & State</span>
      </div>

      {/* Session Service Type */}
      <div>
        <label className="text-[10px] font-medium text-slate-600 block mb-1">Session Service</label>
        <select
          value={data.sessionType || 'in-memory'}
          onChange={(e) => onUpdate({ sessionType: e.target.value })}
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
        >
          {SESSION_TYPES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <p className="text-[10px] text-slate-400 mt-0.5">{activeType.description}</p>
      </div>

      {/* Dynamic fields based on session type */}
      {activeType.fields.map((field) => (
        <div key={field.key}>
          <label className="text-[10px] font-medium text-slate-600 block mb-1">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={data[field.key] || ''}
            onChange={(e) => onUpdate({ [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
          />
        </div>
      ))}

      {/* Initial State */}
      <div>
        <label className="text-[10px] font-medium text-slate-600 block mb-1">
          Initial State (JSON)
        </label>
        <textarea
          value={data.initialState || ''}
          onChange={(e) => onUpdate({ initialState: e.target.value })}
          placeholder='{"topic": "AI agents", "language": "English"}'
          rows={3}
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md font-mono resize-y"
        />
        <p className="text-[10px] text-slate-400 mt-0.5">
          Key-value pairs available as session.state. Use prefixes: user: (per-user), app: (global), temp: (ephemeral)
        </p>
      </div>
    </div>
  );
}
