import type { DescopeUser, UserProfile, DescopeTenant } from '../types/user.types';

/**
 * Utility functions for working with Descope SDK
 */

/**
 * Extracts user profile information from Descope user object
 */
export function extractUserProfile(descopeUser: DescopeUser): UserProfile {
  const email = descopeUser.email ?? (descopeUser.loginIds[0] ?? '');
  const name = descopeUser.name ?? (`${descopeUser.givenName ?? ''} ${descopeUser.familyName ?? ''}`.trim() || 'Unknown User');

  return {
    userId: descopeUser.userId,
    email,
    name,
    ...(descopeUser.givenName !== undefined && { givenName: descopeUser.givenName }),
    ...(descopeUser.familyName !== undefined && { familyName: descopeUser.familyName }),
    ...(descopeUser.customAttributes !== undefined && { customAttributes: descopeUser.customAttributes }),
  };
}

/**
 * Validates environment configuration
 */
export function validateEnvironment(): void {
  const projectId = (import.meta as any).env?.VITE_DESCOPE_PROJECT_ID;

  if (!projectId) {
    throw new Error(
      'VITE_DESCOPE_PROJECT_ID environment variable is not configured. ' +
      'Please check your .env file.'
    );
  }
}

/**
 * Gets the Descope project ID from environment variables
 */
export function getDescopeProjectId(): string {
  const projectId = (import.meta as any).env?.VITE_DESCOPE_PROJECT_ID;

  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Descope project ID is not configured');
  }

  return projectId;
}

/**
 * Formats tenant information for display
 */
export function formatTenantName(tenant: DescopeTenant): string {
  return tenant.tenantName ?? tenant.tenantId;
}

/**
 * Safely parses custom attributes
 */
export function parseCustomAttributes(
  attributes: Record<string, unknown> | undefined
): Record<string, string> {
  if (!attributes) {
    return {};
  }

  const parsed: Record<string, string> = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (value !== null && value !== undefined) {
      parsed[key] = String(value);
    }
  }

  return parsed;
}
