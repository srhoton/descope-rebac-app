/**
 * Custom hook for Descope authentication
 */

import { useCallback, useMemo } from 'react';
import { useDescope as useDescopeSdk, useUser } from '@descope/react-sdk';
import { useNavigate } from 'react-router-dom';

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
  const sdk = useDescopeSdk();
  const navigate = useNavigate();

  // Derive isAuthenticated directly from user to avoid race conditions
  const isAuthenticated = !!user;

  const logout = useCallback(async () => {
    try {
      // Use Descope SDK logout method
      await sdk.logout();
      // Navigate to login page after logout
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('[useDescope] Logout failed:', error);
      // Navigate to login page even if logout fails
      navigate('/login', { replace: true });
    }
  }, [sdk, navigate]);

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
