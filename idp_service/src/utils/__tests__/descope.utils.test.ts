import { describe, it, expect } from 'vitest';
import {
  extractUserProfile,
  validateEnvironment,
  getDescopeProjectId,
  formatTenantName,
  parseCustomAttributes,
} from '../descope.utils';
import type { DescopeUser, DescopeTenant } from '../../types/user.types';

describe('descope.utils', () => {
  describe('extractUserProfile', () => {
    it('should extract user profile with all fields', () => {
      const descopeUser: DescopeUser = {
        userId: 'user123',
        loginIds: ['user@example.com'],
        email: 'user@example.com',
        name: 'John Doe',
        givenName: 'John',
        familyName: 'Doe',
        customAttributes: { role: 'admin' },
      };

      const profile = extractUserProfile(descopeUser);

      expect(profile.userId).toBe('user123');
      expect(profile.email).toBe('user@example.com');
      expect(profile.name).toBe('John Doe');
      expect(profile.givenName).toBe('John');
      expect(profile.familyName).toBe('Doe');
      expect(profile.customAttributes).toEqual({ role: 'admin' });
    });

    it('should fallback to loginIds for email', () => {
      const descopeUser: DescopeUser = {
        userId: 'user123',
        loginIds: ['fallback@example.com'],
      };

      const profile = extractUserProfile(descopeUser);

      expect(profile.email).toBe('fallback@example.com');
    });

    it('should construct name from givenName and familyName', () => {
      const descopeUser: DescopeUser = {
        userId: 'user123',
        loginIds: ['user@example.com'],
        givenName: 'Jane',
        familyName: 'Smith',
      };

      const profile = extractUserProfile(descopeUser);

      expect(profile.name).toBe('Jane Smith');
    });

    it('should use default name when no name fields present', () => {
      const descopeUser: DescopeUser = {
        userId: 'user123',
        loginIds: ['user@example.com'],
      };

      const profile = extractUserProfile(descopeUser);

      expect(profile.name).toBe('Unknown User');
    });
  });

  describe('validateEnvironment', () => {
    it('should not throw when project ID is set', () => {
      expect(() => validateEnvironment()).not.toThrow();
    });
  });

  describe('getDescopeProjectId', () => {
    it('should return project ID from environment', () => {
      const projectId = getDescopeProjectId();
      expect(projectId).toBe('P38a668rJn8AUs65nESCiJqendj6');
    });
  });

  describe('formatTenantName', () => {
    it('should return tenant name if available', () => {
      const tenant: DescopeTenant = {
        tenantId: 'tenant123',
        tenantName: 'Acme Corp',
      };

      expect(formatTenantName(tenant)).toBe('Acme Corp');
    });

    it('should fallback to tenant ID', () => {
      const tenant: DescopeTenant = {
        tenantId: 'tenant123',
      };

      expect(formatTenantName(tenant)).toBe('tenant123');
    });
  });

  describe('parseCustomAttributes', () => {
    it('should parse valid custom attributes', () => {
      const attributes = {
        role: 'admin',
        department: 'Engineering',
        level: 5,
      };

      const parsed = parseCustomAttributes(attributes);

      expect(parsed).toEqual({
        role: 'admin',
        department: 'Engineering',
        level: '5',
      });
    });

    it('should return empty object for undefined attributes', () => {
      expect(parseCustomAttributes(undefined)).toEqual({});
    });

    it('should skip null and undefined values', () => {
      const attributes = {
        role: 'admin',
        department: null,
        level: undefined,
      };

      const parsed = parseCustomAttributes(attributes);

      expect(parsed).toEqual({ role: 'admin' });
    });
  });
});
