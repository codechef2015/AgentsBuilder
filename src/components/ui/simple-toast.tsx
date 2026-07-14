/**
 * Simple Toast — Global toast state via module-level store
 * 
 * Avoids React hook ordering issues by using a simple pub/sub pattern.
 * Components subscribe to toast events and render them.
 *
 * Usage:
 *   import { showToast, ToastRenderer } from './ui/simple-toast';
 *   showToast('Saved!', 'success');
 *   // In your root layout: <ToastRenderer />
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

interface ToastItem {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
}

// Module-level store
let toastId = 0;
let listeners: Array<(toasts: ToastItem[]) => void> = [];
let currentToasts: ToastItem[] = [];

function notify() {
  listeners.forEach(fn => fn([...currentToasts]));
}

export function showToast(message: string, variant: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) {
  const id = ++toastId;
  currentToasts = [...currentToasts, { id, message, variant }];
  notify();

  if (duration > 0) {
    setTimeout(() => {
      currentToasts = currentToasts.filter(t => t.id !== id);
      notify();
    }, duration);
  }
}

export function ToastRenderer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter(fn => fn !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.variant];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-lg text-sm font-medium max-w-sm ${variants[t.variant]}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => {
                currentToasts = currentToasts.filter(x => x.id !== t.id);
                notify();
              }}
              className="opacity-60 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
