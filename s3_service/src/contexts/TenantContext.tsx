/**
 * Context for managing tenant selection
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type FC,
  type ReactNode,
} from 'react';
import { useUser, useSession } from '@descope/react-sdk';

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

export interface Tenant {
  tenantId: string;
  tenantName?: string;
  roleNames?: string[];
}

interface TenantContextValue {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant) => void;
  needsTenantSelection: boolean;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

const TENANT_STORAGE_KEY = 's3_service_selected_tenant';

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Provider component for tenant context
 */
export const TenantProvider: FC<TenantProviderProps> = ({ children }) => {
  const { user, isUserLoading } = useUser();
  const { sessionToken } = useSession();
  const [selectedTenant, setSelectedTenantState] = useState<Tenant | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Extract tenants from user object
  const tenants: Tenant[] = (user?.userTenants ?? []).map((t: { tenantId: string; tenantName?: string; roleNames?: string[] }) => {
    const tenant: Tenant = { tenantId: t.tenantId };
    if (t.tenantName) {
      tenant.tenantName = t.tenantName;
    }
    if (t.roleNames) {
      tenant.roleNames = t.roleNames;
    }
    return tenant;
  });

  // Get current tenant from JWT's dct claim
  useEffect(() => {
    if (isUserLoading || !sessionToken || tenants.length === 0) {
      return;
    }

    // Decode JWT to get the dct (Descope current tenant) claim
    const claims = decodeJwt(sessionToken);
    const dctClaim = claims?.['dct'] as string | undefined;

    // Only update if dct claim exists and differs from current selection
    if (dctClaim && selectedTenant?.tenantId !== dctClaim) {
      // Find tenant matching the dct claim
      const matchingTenant = tenants.find((t) => t.tenantId === dctClaim);
      if (matchingTenant) {
        setSelectedTenantState(matchingTenant);
        localStorage.setItem(TENANT_STORAGE_KEY, matchingTenant.tenantId);
      }
    }

    if (!initialized) {
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoading, sessionToken, selectedTenant?.tenantId]);

  // Fallback: Auto-select if only one tenant and no JWT dct claim matched
  useEffect(() => {
    if (!initialized || selectedTenant) {
      return;
    }

    if (tenants.length === 1) {
      const onlyTenant = tenants[0];
      if (onlyTenant) {
        setSelectedTenantState(onlyTenant);
        localStorage.setItem(TENANT_STORAGE_KEY, onlyTenant.tenantId);
      }
    }
  }, [initialized, tenants, selectedTenant]);

  const setSelectedTenant = useCallback((tenant: Tenant) => {
    setSelectedTenantState(tenant);
    localStorage.setItem(TENANT_STORAGE_KEY, tenant.tenantId);
  }, []);

  // Determine if tenant selection is needed
  const needsTenantSelection = initialized && tenants.length > 1 && !selectedTenant;

  const value: TenantContextValue = {
    tenants,
    selectedTenant,
    setSelectedTenant,
    needsTenantSelection,
    isLoading: isUserLoading || !initialized,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

/**
 * Hook to access tenant context
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
