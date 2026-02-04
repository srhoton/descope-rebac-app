/**
 * Context for managing tenant selection
 *
 * This module provides tenant management using Zustand for global state (ADR-005)
 * with a React provider component for syncing Descope authentication data.
 */

import { useEffect, type FC, type ReactNode } from 'react';
import { useUser, useSession } from '@descope/react-sdk';
import { useTenantStore, type Tenant } from '../stores/tenantStore';

// Re-export Tenant type for backward compatibility
export type { Tenant } from '../stores/tenantStore';

/**
 * Decode a JWT token to extract claims (without verification)
 */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export interface TenantContextValue {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant) => void;
  needsTenantSelection: boolean;
  isLoading: boolean;
}

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Provider component that syncs Descope authentication data with Zustand tenant store
 *
 * This provider:
 * 1. Extracts tenants from the Descope user object
 * 2. Reads the current tenant from the JWT's dct claim
 * 3. Syncs this data into the Zustand store
 *
 * Components should use the useTenant() hook to access tenant state.
 */
export const TenantProvider: FC<TenantProviderProps> = ({ children }) => {
  const { user, isUserLoading } = useUser();
  const { sessionToken } = useSession();

  // Get state and actions from Zustand store
  const selectedTenant = useTenantStore((state) => state.selectedTenant);
  const initialized = useTenantStore((state) => state.initialized);
  const setSelectedTenant = useTenantStore((state) => state.setSelectedTenant);
  const setInitialized = useTenantStore((state) => state.setInitialized);

  // Extract tenants from user object
  const tenants: Tenant[] = (
    user?.userTenants ?? []
  ).map(
    (t: { tenantId: string; tenantName?: string; roleNames?: string[] }) => {
      const tenant: Tenant = { tenantId: t.tenantId };
      if (t.tenantName) {
        tenant.tenantName = t.tenantName;
      }
      if (t.roleNames) {
        tenant.roleNames = t.roleNames;
      }
      return tenant;
    }
  );

  // Sync JWT's dct (Descope current tenant) claim to Zustand store
  useEffect(() => {
    if (isUserLoading || !sessionToken || tenants.length === 0) {
      return;
    }

    // Decode JWT to get the dct claim
    const claims = decodeJwt(sessionToken);
    const dctClaim = claims?.['dct'] as string | undefined;

    // Only update if dct claim exists and differs from current selection
    if (dctClaim && selectedTenant?.tenantId !== dctClaim) {
      const matchingTenant = tenants.find((t) => t.tenantId === dctClaim);
      if (matchingTenant) {
        setSelectedTenant(matchingTenant);
      }
    }

    if (!initialized) {
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoading, sessionToken, selectedTenant?.tenantId]);

  // Auto-select if only one tenant and no JWT dct claim matched
  useEffect(() => {
    if (!initialized || selectedTenant) {
      return;
    }

    if (tenants.length === 1) {
      const onlyTenant = tenants[0];
      if (onlyTenant) {
        setSelectedTenant(onlyTenant);
      }
    }
  }, [initialized, tenants, selectedTenant, setSelectedTenant]);

  return <>{children}</>;
};

/**
 * Hook to access tenant state
 *
 * This hook combines Zustand store state with Descope user data
 * to provide a complete tenant context.
 *
 * @returns TenantContextValue with tenants, selectedTenant, and actions
 * @throws Error if used outside of TenantProvider (due to Descope hook requirements)
 */
export function useTenant(): TenantContextValue {
  const { user, isUserLoading } = useUser();

  // Get state and actions from Zustand store
  const selectedTenant = useTenantStore((state) => state.selectedTenant);
  const initialized = useTenantStore((state) => state.initialized);
  const setSelectedTenant = useTenantStore((state) => state.setSelectedTenant);

  // Extract tenants from user object
  const tenants: Tenant[] = (
    user?.userTenants ?? []
  ).map(
    (t: { tenantId: string; tenantName?: string; roleNames?: string[] }) => {
      const tenant: Tenant = { tenantId: t.tenantId };
      if (t.tenantName) {
        tenant.tenantName = t.tenantName;
      }
      if (t.roleNames) {
        tenant.roleNames = t.roleNames;
      }
      return tenant;
    }
  );

  // Determine if tenant selection is needed
  const needsTenantSelection =
    initialized && tenants.length > 1 && selectedTenant === null;

  return {
    tenants,
    selectedTenant,
    setSelectedTenant,
    needsTenantSelection,
    isLoading: isUserLoading || !initialized,
  };
}
