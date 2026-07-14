/**
 * Framework Context
 * 
 * React Context that provides the active framework adapter to all components.
 * Components use `useFramework()` to access the current adapter.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FrameworkAdapter, FrameworkId } from '../frameworks/types';
import { FrameworkRegistry, setStoredFramework } from '../frameworks/registry';

interface FrameworkContextValue {
  /** Currently active framework adapter (null if on selector page) */
  framework: FrameworkAdapter | null;
  /** Currently active framework ID */
  frameworkId: FrameworkId | null;
  /** Switch to a different framework */
  selectFramework: (id: FrameworkId) => void;
  /** Go back to framework selector (clear active framework) */
  exitToSelector: () => void;
  /** Whether a framework is currently active */
  isFrameworkActive: boolean;
}

const FrameworkContext = createContext<FrameworkContextValue | null>(null);

interface FrameworkProviderProps {
  children: ReactNode;
  initialFramework?: FrameworkId | null;
}

export function FrameworkProvider({ children, initialFramework = null }: FrameworkProviderProps) {
  const [frameworkId, setFrameworkId] = useState<FrameworkId | null>(initialFramework);

  const framework = frameworkId ? FrameworkRegistry.get(frameworkId) ?? null : null;

  const selectFramework = useCallback((id: FrameworkId) => {
    if (FrameworkRegistry.has(id)) {
      setFrameworkId(id);
      setStoredFramework(id);
    } else {
      console.error(`Framework "${id}" is not registered.`);
    }
  }, []);

  const exitToSelector = useCallback(() => {
    setFrameworkId(null);
  }, []);

  const value: FrameworkContextValue = {
    framework,
    frameworkId,
    selectFramework,
    exitToSelector,
    isFrameworkActive: framework !== null,
  };

  return (
    <FrameworkContext.Provider value={value}>
      {children}
    </FrameworkContext.Provider>
  );
}

/**
 * Hook to access the current framework context.
 * Must be used within a FrameworkProvider.
 */
export function useFramework(): FrameworkContextValue {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error('useFramework must be used within a FrameworkProvider');
  }
  return context;
}

/**
 * Hook that returns the active framework adapter.
 * Throws if no framework is selected (use on builder pages only).
 */
export function useActiveFramework(): FrameworkAdapter {
  const { framework } = useFramework();
  if (!framework) {
    throw new Error('No framework is active. This hook should only be used in builder context.');
  }
  return framework;
}
