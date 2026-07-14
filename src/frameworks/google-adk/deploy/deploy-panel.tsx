/**
 * ADK Deploy Panel
 * 
 * Main deployment panel for Google ADK — Vertex AI Agent Engine and Cloud Run.
 */

import { useState } from 'react';
import { Cloud, Container, Rocket } from 'lucide-react';

interface ADKDeployPanelProps {
  code?: string;
}

type DeployTarget = 'vertex-ai' | 'cloud-run';

export function ADKDeployPanel({ code }: ADKDeployPanelProps) {
  const [target, setTarget] = useState<DeployTarget>('vertex-ai');

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Rocket size={16} className="text-emerald-600" />
        <h3 className="text-sm font-semibold text-slate-800">Deploy (Google ADK)</h3>
      </div>

      {/* Target Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setTarget('vertex-ai')}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            target === 'vertex-ai'
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <Cloud size={16} className="text-emerald-600 mb-1" />
          <div className="text-[11px] font-semibold text-slate-800">Vertex AI Agent Engine</div>
          <div className="text-[10px] text-slate-500">Managed runtime</div>
        </button>

        <button
          onClick={() => setTarget('cloud-run')}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            target === 'cloud-run'
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <Container size={16} className="text-blue-600 mb-1" />
          <div className="text-[11px] font-semibold text-slate-800">Cloud Run</div>
          <div className="text-[10px] text-slate-500">Serverless container</div>
        </button>
      </div>

      {/* Vertex AI Config */}
      {target === 'vertex-ai' && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <label className="text-[10px] font-medium text-slate-600 block mb-1">GCP Project ID *</label>
            <input
              type="text"
              placeholder="my-gcp-project"
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-600 block mb-1">Region</label>
            <select className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md">
              <option value="us-central1">us-central1</option>
              <option value="us-east1">us-east1</option>
              <option value="europe-west1">europe-west1</option>
              <option value="asia-east1">asia-east1</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-600 block mb-1">App Name</label>
            <input
              type="text"
              placeholder="agent-builder-app"
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
            />
          </div>

          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-[10px] text-emerald-700">
            <p className="font-medium">Prerequisites:</p>
            <ul className="list-disc pl-3 mt-1 space-y-0.5">
              <li>Google Cloud SDK installed & authenticated</li>
              <li>Vertex AI API enabled in project</li>
              <li>Agent Builder API enabled</li>
            </ul>
          </div>

          <button className="w-full px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
            <Rocket size={12} />
            Deploy to Vertex AI
          </button>
        </div>
      )}

      {/* Cloud Run Config */}
      {target === 'cloud-run' && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <label className="text-[10px] font-medium text-slate-600 block mb-1">GCP Project ID *</label>
            <input
              type="text"
              placeholder="my-gcp-project"
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-600 block mb-1">Service Name *</label>
            <input
              type="text"
              placeholder="my-agent-service"
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-600 block mb-1">Region</label>
            <select className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md">
              <option value="us-central1">us-central1</option>
              <option value="us-east1">us-east1</option>
              <option value="europe-west1">europe-west1</option>
              <option value="asia-east1">asia-east1</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-slate-600 block mb-1">Memory</label>
              <select className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md">
                <option value="512Mi">512 MB</option>
                <option value="1Gi">1 GB</option>
                <option value="2Gi">2 GB</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-600 block mb-1">CPU</label>
              <select className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md">
                <option value="1">1 vCPU</option>
                <option value="2">2 vCPUs</option>
              </select>
            </div>
          </div>

          <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700">
            <p className="font-medium">Generates:</p>
            <ul className="list-disc pl-3 mt-1 space-y-0.5">
              <li>Dockerfile with Python + ADK dependencies</li>
              <li>FastAPI wrapper for A2A/HTTP endpoint</li>
              <li>cloudbuild.yaml for CI/CD</li>
            </ul>
          </div>

          <button className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Rocket size={12} />
            Deploy to Cloud Run
          </button>
        </div>
      )}
    </div>
  );
}
