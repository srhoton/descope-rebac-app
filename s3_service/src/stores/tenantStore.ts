/**
 * Zustand store for tenant state management
 *
 * This store manages global tenant selection state per ADR-005.
 * It uses persist middleware to save selected tenant to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tenant {
  tenantId: string;
  tenantName?: string;
  roleNames?: string[];
}

interface TenantState {
  /** Currently selected tenant */
  selectedTenant: Tenant | null;
  /** Whether the store has been initialized from JWT/localStorage */
  initialized: boolean;
}

interface TenantActions {
  /** Set the selected tenant */
  setSelectedTenant: (tenant: Tenant) => void;
  /** Mark the store as initialized */
  setInitialized: (value: boolean) => void;
  /** Clear tenant selection (e.g., on logout) */
  clearTenant: () => void;
}

type TenantStore = TenantState & TenantActions;

const TENANT_STORAGE_KEY = 's3_service_selected_tenant';

/**
 * Global Zustand store for tenant management
 *
 * Usage:
 * ```ts
 * const { selectedTenant, setSelectedTenant } = useTenantStore();
 * ```
 *
 * Or with selectors for performance:
 * ```ts
 * const selectedTenant = useTenantStore((state) => state.selectedTenant);
 * ```
 */
export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      // Initial state
      selectedTenant: null,
      initialized: false,

      // Actions
      setSelectedTenant: (tenant: Tenant) =>
        set({ selectedTenant: tenant }),

      setInitialized: (value: boolean) =>
        set({ initialized: value }),

      clearTenant: () =>
        set({ selectedTenant: null, initialized: false }),
    }),
    {
      name: TENANT_STORAGE_KEY,
      // Only persist selectedTenant, not initialized state
      partialize: (state) => ({ selectedTenant: state.selectedTenant }),
    }
  )
);

/**
 * Selector for checking if tenant selection is needed
 * Use this when you need derived state
 */
export const selectNeedsTenantSelection = (
  state: TenantStore,
  tenantCount: number
): boolean => state.initialized && tenantCount > 1 && state.selectedTenant === null;
