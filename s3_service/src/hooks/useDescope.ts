/**
 * Custom hook for Descope authentication
 */

import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@descope/react-sdk';

export interface UseDescopeResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    userId: string;
    email?: string;
    name?: string;
  } | null;
  logout: () => void;
}

/**
 * Hook for accessing Descope authentication state
 */
export function useDescope(): UseDescopeResult {
  const { user, isUserLoading } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const logout = useCallback(() => {
    // Redirect to IDP service logout
    const idpDomain = import.meta.env['VITE_IDP_DOMAIN'] as string;
    if (idpDomain) {
      window.location.href = `https://${idpDomain}/?logout=true`;
    } else {
      console.error('IDP_DOMAIN not configured');
    }
  }, []);

  return {
    isAuthenticated,
    isLoading: isUserLoading,
    user: user
      ? {
          userId: user.userId,
          email: user.email,
          name: user.name,
        }
      : null,
    logout,
  };
}
