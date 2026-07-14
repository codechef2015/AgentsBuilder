/**
 * Deploy Progress Stepper — Shows deployment stages
 */

import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

export type DeployStage = 'packaging' | 'uploading' | 'creating' | 'verifying' | 'complete' | 'failed';

interface DeployProgressProps {
  currentStage: DeployStage;
  error?: string;
  className?: string;
}

const stages: { id: DeployStage; label: string }[] = [
  { id: 'packaging', label: 'Packaging code' },
  { id: 'uploading', label: 'Uploading to AWS' },
  { id: 'creating', label: 'Creating resources' },
  { id: 'verifying', label: 'Verifying deployment' },
  { id: 'complete', label: 'Deployed!' },
];

function getStageIndex(stage: DeployStage): number {
  if (stage === 'failed') return -1;
  return stages.findIndex(s => s.id === stage);
}

export function DeployProgress({ currentStage, error, className = '' }: DeployProgressProps) {
  const currentIndex = getStageIndex(currentStage);
  const isFailed = currentStage === 'failed';

  return (
    <div className={`px-4 py-3 ${className}`}>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isPending = i > currentIndex;

          return (
            <div key={stage.id} className="flex items-center gap-2.5">
              {/* Icon */}
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : isCurrent && !isFailed ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
              ) : isFailed && isCurrent ? (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}

              {/* Label */}
              <span className={`text-xs font-medium ${
                isComplete ? 'text-green-700' :
                isCurrent && !isFailed ? 'text-blue-700' :
                isFailed && isCurrent ? 'text-red-700' :
                'text-gray-400'
              }`}>
                {stage.label}
              </span>

              {/* Connector line */}
              {i < stages.length - 1 && (
                <div className={`flex-1 h-px ${isComplete ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
