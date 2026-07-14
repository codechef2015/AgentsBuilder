/**
 * WelcomeOverlay — First-time user onboarding
 *
 * Shows a quick-start guide for new users. Dismisses permanently
 * after clicking "Get Started" (stored in localStorage).
 *
 * Features:
 * - 3-step visual guide
 * - One-click dismiss
 * - Never shows again once dismissed
 * - Accessible (keyboard navigable, proper focus)
 */

import { Bot, ArrowRight, Zap, X } from 'lucide-react';

const WELCOME_DISMISSED_KEY = 'agent_studio_welcome_dismissed';

export function shouldShowWelcome(): boolean {
  try {
    return !localStorage.getItem(WELCOME_DISMISSED_KEY);
  } catch {
    return false;
  }
}

export function dismissWelcome() {
  try {
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

export function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const handleDismiss = () => {
    dismissWelcome();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Welcome to AgenticBuilder</h2>
          <p className="text-blue-100 text-sm">
            Build AI agent workflows visually in 3 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-blue-700">1</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Drag nodes from the sidebar</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Start with an <strong>Input</strong> node, add an <strong>Agent</strong>, then connect to an <strong>Output</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-indigo-700">2</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Configure in the property panel</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Click any node to configure its model, tools, guardrails, and more
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-green-700">3</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Generate code & execute</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                View the generated Python code, run locally, or deploy to AWS with one click
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Powered by Strands SDK & Google ADK</span>
          </div>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            autoFocus
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
