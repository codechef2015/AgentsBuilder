import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { type Node, type Edge } from '@xyflow/react';
import { Code, Download, Play, AlertCircle, Edit3, Save, X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { getValidationSummary, type ValidationIssue } from '../lib/flow-validator';
import { useCodeGenerator, useFlowValidator } from '../frameworks/hooks';
import { useFramework } from '../context/framework-context';

interface CodePanelProps {
  nodes: Node[];
  edges: Edge[];
  graphMode?: boolean;
  className?: string;
  onNavigateToNode?: (nodeId: string) => void;
}

export function CodePanel({ nodes, edges, graphMode = false, className = '', onNavigateToNode }: CodePanelProps) {
  const { framework } = useFramework();
  const generateCode = useCodeGenerator();
  const frameworkValidator = useFlowValidator();
  const [generatedCode, setGeneratedCode] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showValidation, setShowValidation] = useState(true);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [flowChangedWhileEditing, setFlowChangedWhileEditing] = useState(false);

  useEffect(() => {
    // Use framework-aware code generator
    const fullCode = generateCode(nodes, edges, { graphMode });

    // Use framework-aware validator
    const issues = frameworkValidator(nodes, edges);
    setValidationIssues(issues);

    if (isInEditMode) {
      // Flow changed while user is editing - mark as conflict
      setFlowChangedWhileEditing(true);
    } else {
      // Normal case - update both generated and edited code
      setGeneratedCode(fullCode);
      setEditedCode(fullCode);
      setFlowChangedWhileEditing(false);
    }

    setErrors([]);
  }, [nodes, edges, graphMode, isInEditMode, generateCode, frameworkValidator]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && isInEditMode) {
      setEditedCode(value);
      setHasUnsavedChanges(value !== generatedCode);
    }
  };

  const handleEdit = () => {
    setIsInEditMode(true);
    setEditedCode(generatedCode);
    setHasUnsavedChanges(false);
    setFlowChangedWhileEditing(false);
  };

  const handleSave = () => {
    setGeneratedCode(editedCode);
    setIsInEditMode(false);
    setHasUnsavedChanges(false);
    setFlowChangedWhileEditing(false);
  };

  const handleCancel = () => {
    setEditedCode(generatedCode);
    setIsInEditMode(false);
    setHasUnsavedChanges(false);
    setFlowChangedWhileEditing(false);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = framework?.id === 'google-adk' ? 'adk_agent.py' : 'strands_agent.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExecute = async () => {
    // Switch to execution panel for actual execution
    window.dispatchEvent(new CustomEvent('switchToExecution'));
  };

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
            <Code className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Generated Code</h3>
            <p className="text-[10px] text-gray-400">
              {generatedCode ? `${generatedCode.split('\n').length} lines • Python` : 'No code yet'}
            </p>
          </div>
          {isInEditMode && hasUnsavedChanges && (
            <span className="px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-700 rounded-full font-medium">
              Modified
            </span>
          )}
          {flowChangedWhileEditing && (
            <span className="px-1.5 py-0.5 text-[10px] bg-orange-100 text-orange-700 rounded-full font-medium">
              Conflict
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {!isInEditMode ? (
            <>
              <button
                onClick={() => { navigator.clipboard.writeText(generatedCode); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
              <button
                onClick={handleEdit}
                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                title="Edit code manually"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={`Download as ${framework?.id === 'google-adk' ? 'adk_agent.py' : 'strands_agent.py'}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-0.5" />
              <button
                onClick={handleExecute}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
                title="Execute code"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Cancel editing"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
                title="Save changes"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="px-4 py-2.5 bg-red-50 border-b border-red-100 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-800">
              {errors.length} issue{errors.length > 1 ? 's' : ''} found
            </span>
          </div>
          <ul className="text-[11px] text-red-600 space-y-0.5">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Issues */}
      {showValidation && validationIssues.length > 0 && !isInEditMode && (
        <div className="border-b border-gray-200 flex-shrink-0 max-h-48 overflow-y-auto">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2">
              {(() => {
                const summary = getValidationSummary(validationIssues);
                return (
                  <>
                    {summary.errors > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-red-600">
                        <AlertCircle className="w-3 h-3" /> {summary.errors} error{summary.errors > 1 ? 's' : ''}
                      </span>
                    )}
                    {summary.warnings > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
                        <AlertTriangle className="w-3 h-3" /> {summary.warnings} warning{summary.warnings > 1 ? 's' : ''}
                      </span>
                    )}
                    {summary.info > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-blue-600">
                        <Info className="w-3 h-3" /> {summary.info} suggestion{summary.info > 1 ? 's' : ''}
                      </span>
                    )}
                    {summary.isValid && summary.warnings === 0 && summary.info === 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                        <CheckCircle2 className="w-3 h-3" /> All checks passed
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
            <button
              onClick={() => setShowValidation(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
              title="Hide validation"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {validationIssues.map((issue) => (
              <div
                key={issue.id}
                className={`px-3 py-2 flex items-start gap-2 ${issue.nodeId ? 'cursor-pointer hover:bg-blue-50/50 transition-colors' : ''}`}
                onClick={() => {
                  if (issue.nodeId && onNavigateToNode) {
                    onNavigateToNode(issue.nodeId);
                  }
                }}
                title={issue.nodeId ? `Click to navigate to "${issue.nodeLabel || 'node'}"` : undefined}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {issue.severity === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                  {issue.severity === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  {issue.severity === 'info' && <Info className="w-3 h-3 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-800">{issue.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{issue.description}</p>
                  {issue.fix && (
                    <p className="text-[10px] text-indigo-600 mt-0.5">💡 {issue.fix}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {issue.nodeId && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition-colors">
                      Go →
                    </span>
                  )}
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {issue.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation toggle when hidden */}
      {!showValidation && validationIssues.length > 0 && !isInEditMode && (
        <button
          onClick={() => setShowValidation(true)}
          className="px-3 py-1.5 border-b border-gray-200 flex items-center gap-2 text-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-50 w-full text-left flex-shrink-0"
        >
          {(() => {
            const s = getValidationSummary(validationIssues);
            return <>Show {s.errors + s.warnings + s.info} validation issue{(s.errors + s.warnings + s.info) > 1 ? 's' : ''}</>;
          })()}
        </button>
      )}

      {/* Code Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="python"
          theme="vs-light"
          value={isInEditMode ? editedCode : generatedCode}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            readOnly: !isInEditMode,
          }}
        />
      </div>

      {/* Conflict Warning */}
      {flowChangedWhileEditing && (
        <div className="p-3 bg-orange-50 border-t border-orange-200">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-orange-800">Flow Changed While Editing</span>
          </div>
          <p className="text-sm text-orange-700 mb-2">
            The flow diagram was modified while you were editing the code. Your changes may conflict with the new generated code.
          </p>
          <div className="flex space-x-2 text-xs">
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300"
            >
              Discard Changes & Use New Code
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Keep My Changes
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Python • {framework?.id === 'google-adk' ? 'Google ADK' : 'Strands Agents SDK'}</span>
          <span>{(isInEditMode ? editedCode : generatedCode).split('\n').length} lines</span>
        </div>
      </div>
    </div>
  );
}