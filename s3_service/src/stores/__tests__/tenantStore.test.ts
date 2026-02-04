/**
 * Tests for Zustand tenant store (ADR-005 compliance)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useTenantStore,
  selectNeedsTenantSelection,
  type Tenant,
} from '../tenantStore';

describe('useTenantStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useTenantStore.setState({
        selectedTenant: null,
        initialized: false,
      });
    });
    // Clear localStorage
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have null selectedTenant initially', () => {
      const state = useTenantStore.getState();
      expect(state.selectedTenant).toBeNull();
    });

    it('should have initialized as false initially', () => {
      const state = useTenantStore.getState();
      expect(state.initialized).toBe(false);
    });
  });

  describe('setSelectedTenant', () => {
    it('should set the selected tenant', () => {
      const tenant: Tenant = {
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
      };

      act(() => {
        useTenantStore.getState().setSelectedTenant(tenant);
      });

      const state = useTenantStore.getState();
      expect(state.selectedTenant).toEqual(tenant);
    });

    it('should persist tenant to localStorage', () => {
      const tenant: Tenant = {
        tenantId: 'tenant-456',
        tenantName: 'Persisted Tenant',
      };

      act(() => {
        useTenantStore.getState().setSelectedTenant(tenant);
      });

      // Check localStorage (Zustand persist middleware stores as JSON)
      const stored = localStorage.getItem('s3_service_selected_tenant');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored ?? '{}') as {
        state?: { selectedTenant?: { tenantId: string } };
      };
      expect(parsed.state?.selectedTenant?.tenantId).toBe('tenant-456');
    });

    it('should update tenant with roleNames', () => {
      const tenant: Tenant = {
        tenantId: 'tenant-789',
        tenantName: 'Tenant With Roles',
        roleNames: ['admin', 'user'],
      };

      act(() => {
        useTenantStore.getState().setSelectedTenant(tenant);
      });

      const state = useTenantStore.getState();
      expect(state.selectedTenant?.roleNames).toEqual(['admin', 'user']);
    });
  });

  describe('setInitialized', () => {
    it('should set initialized to true', () => {
      act(() => {
        useTenantStore.getState().setInitialized(true);
      });

      const state = useTenantStore.getState();
      expect(state.initialized).toBe(true);
    });

    it('should set initialized to false', () => {
      // First set to true
      act(() => {
        useTenantStore.getState().setInitialized(true);
      });

      // Then set back to false
      act(() => {
        useTenantStore.getState().setInitialized(false);
      });

      const state = useTenantStore.getState();
      expect(state.initialized).toBe(false);
    });
  });

  describe('clearTenant', () => {
    it('should clear selected tenant and reset initialized', () => {
      // Setup: set tenant and initialized
      act(() => {
        useTenantStore.getState().setSelectedTenant({
          tenantId: 'tenant-to-clear',
          tenantName: 'Will Be Cleared',
        });
        useTenantStore.getState().setInitialized(true);
      });

      // Verify setup
      expect(useTenantStore.getState().selectedTenant).not.toBeNull();
      expect(useTenantStore.getState().initialized).toBe(true);

      // Clear
      act(() => {
        useTenantStore.getState().clearTenant();
      });

      // Verify cleared
      const state = useTenantStore.getState();
      expect(state.selectedTenant).toBeNull();
      expect(state.initialized).toBe(false);
    });
  });
});

describe('selectNeedsTenantSelection', () => {
  beforeEach(() => {
    act(() => {
      useTenantStore.setState({
        selectedTenant: null,
        initialized: false,
      });
    });
  });

  it('should return false when not initialized', () => {
    const state = useTenantStore.getState();
    expect(selectNeedsTenantSelection(state, 5)).toBe(false);
  });

  it('should return false when only one tenant available', () => {
    act(() => {
      useTenantStore.getState().setInitialized(true);
    });

    const state = useTenantStore.getState();
    expect(selectNeedsTenantSelection(state, 1)).toBe(false);
  });

  it('should return false when tenant is already selected', () => {
    act(() => {
      useTenantStore.getState().setInitialized(true);
      useTenantStore.getState().setSelectedTenant({
        tenantId: 'selected-tenant',
      });
    });

    const state = useTenantStore.getState();
    expect(selectNeedsTenantSelection(state, 3)).toBe(false);
  });

  it('should return true when initialized, multiple tenants, and no selection', () => {
    act(() => {
      useTenantStore.getState().setInitialized(true);
    });

    const state = useTenantStore.getState();
    expect(selectNeedsTenantSelection(state, 3)).toBe(true);
  });

  it('should return false when zero tenants available', () => {
    act(() => {
      useTenantStore.getState().setInitialized(true);
    });

    const state = useTenantStore.getState();
    expect(selectNeedsTenantSelection(state, 0)).toBe(false);
  });
});
