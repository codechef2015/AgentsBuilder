import { useState } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { Rocket, Cloud, Server, Container } from 'lucide-react';
import { LambdaDeployPanel } from './lambda-deploy-panel';
import { AgentCoreDeployPanel } from './agentcore-deploy-panel';
import { ECSDeployPanel } from './ecs-deploy-panel';


interface DeployPanelProps {
  nodes: Node[];
  edges: Edge[];
  graphMode?: boolean;
  className?: string;
}

export function DeployPanel({ nodes, edges, graphMode = false, className = '' }: DeployPanelProps) {
  const [deploymentTarget, setDeploymentTarget] = useState<'agentcore' | 'lambda' | 'ecs-fargate'>('agentcore');

  const handleTargetChange = (target: 'agentcore' | 'lambda' | 'ecs-fargate') => {
    setDeploymentTarget(target);
  };

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
            <Rocket className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Deploy Agent</h3>
            <p className="text-[10px] text-gray-400">One-click to AWS</p>
          </div>
        </div>
      </div>

      {/* Deployment Target Selection */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Target</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleTargetChange('agentcore')}
              className={`flex flex-col items-center p-2.5 border rounded-lg transition-all text-center ${
                deploymentTarget === 'agentcore'
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
              }`}
            >
              <Server className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-medium">AgentCore</span>
            </button>
            <button
              onClick={() => handleTargetChange('lambda')}
              className={`flex flex-col items-center p-2.5 border rounded-lg transition-all text-center ${
                deploymentTarget === 'lambda'
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
              }`}
            >
              <Cloud className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-medium">Lambda</span>
            </button>
            <button
              onClick={() => handleTargetChange('ecs-fargate')}
              className={`flex flex-col items-center p-2.5 border rounded-lg transition-all text-center ${
                deploymentTarget === 'ecs-fargate'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
              }`}
            >
              <Container className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-medium">Fargate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Panel Content */}
      {deploymentTarget === 'lambda' ? (
        <LambdaDeployPanel nodes={nodes} edges={edges} graphMode={graphMode} />
      ) : deploymentTarget === 'ecs-fargate' ? (
        <ECSDeployPanel nodes={nodes} edges={edges} graphMode={graphMode} />
      ) : (
        <AgentCoreDeployPanel nodes={nodes} edges={edges} graphMode={graphMode} />
      )}
    </div>
  );
}
