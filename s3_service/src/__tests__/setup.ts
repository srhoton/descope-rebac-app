/**
 * Vitest test setup file
 */

import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Internal store for localStorage mock
const store = new Map<string, string>();

// Mock localStorage for Zustand persist middleware
// Using a plain object to avoid TypeScript readonly issues with Storage interface
const localStorageMock = {
  get length(): number {
    return store.size;
  },
  clear: vi.fn(() => {
    store.clear();
  }),
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  key: vi.fn((index: number) => {
    const keys = Array.from(store.keys());
    return keys[index] ?? null;
  }),
  removeItem: vi.fn((key: string) => {
    store.delete(key);
  }),
  setItem: vi.fn((key: string, value: string) => {
    store.set(key, value);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage with the same implementation
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
});

// Clean up after each test
afterEach(() => {
  // Clean up rendered components
  cleanup();
  // Clear localStorage mock
  store.clear();
  vi.clearAllMocks();
});
