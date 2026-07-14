/**
 * Framework Registry
 * 
 * Central registry that holds all available framework adapters.
 * Components use this to get the active framework's adapter.
 */

import type { FrameworkAdapter, FrameworkId } from './types';

class FrameworkRegistryClass {
  private adapters: Map<FrameworkId, FrameworkAdapter> = new Map();

  /**
   * Register a framework adapter.
   */
  register(adapter: FrameworkAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  /**
   * Get a specific framework adapter by ID.
   */
  get(id: FrameworkId): FrameworkAdapter | undefined {
    return this.adapters.get(id);
  }

  /**
   * Get all registered framework adapters.
   */
  getAll(): FrameworkAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get all framework IDs.
   */
  getIds(): FrameworkId[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if a framework is registered.
   */
  has(id: FrameworkId): boolean {
    return this.adapters.has(id);
  }
}

// Singleton instance
export const FrameworkRegistry = new FrameworkRegistryClass();

// Storage key for persisting selected framework
const FRAMEWORK_STORAGE_KEY = 'agent_builder_framework';

/**
 * Get the last selected framework from localStorage.
 */
export function getStoredFramework(): FrameworkId | null {
  try {
    const stored = localStorage.getItem(FRAMEWORK_STORAGE_KEY);
    if (stored === 'strands' || stored === 'google-adk') {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Store the selected framework to localStorage.
 */
export function setStoredFramework(id: FrameworkId): void {
  try {
    localStorage.setItem(FRAMEWORK_STORAGE_KEY, id);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clear the stored framework selection.
 */
export function clearStoredFramework(): void {
  try {
    localStorage.removeItem(FRAMEWORK_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
