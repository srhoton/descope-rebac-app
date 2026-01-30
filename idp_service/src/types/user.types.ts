/**
 * User type definitions for Descope authentication
 */

export interface DescopeUser {
  userId: string;
  loginIds: string[];
  name?: string;
  email?: string;
  phone?: string;
  verifiedEmail?: boolean;
  verifiedPhone?: boolean;
  picture?: string;
  givenName?: string;
  familyName?: string;
  middleName?: string;
  customAttributes?: Record<string, unknown>;
}

export interface DescopeTenant {
  tenantId: string;
  tenantName?: string;
  roleNames?: string[];
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  currentTenant?: DescopeTenant;
  tenants?: DescopeTenant[];
  roles?: string[];
  permissions?: string[];
  customAttributes?: Record<string, unknown>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: DescopeUser | null;
  sessionToken: string | null;
  error: Error | null;
}
