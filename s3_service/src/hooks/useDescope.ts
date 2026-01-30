/**
 * Custom hook for Descope authentication
 */

import { useCallback, useMemo } from 'react';
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

  // Derive isAuthenticated directly from user to avoid race conditions
  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    // Redirect to IDP service logout
    const idpDomain = import.meta.env['VITE_IDP_DOMAIN'] as string;
    if (idpDomain) {
      window.location.href = `https://${idpDomain}/?logout=true`;
    } else {
      console.error('IDP_DOMAIN not configured');
    }
  }, []);

  const userProfile = useMemo(() => {
    if (!user) return null;
    return {
      userId: user.userId,
      ...(user.email !== undefined && { email: user.email }),
      ...(user.name !== undefined && { name: user.name }),
    };
  }, [user]);

  return {
    isAuthenticated,
    isLoading: isUserLoading,
    user: userProfile,
    logout,
  };
}
