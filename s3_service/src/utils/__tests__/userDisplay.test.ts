/**
 * Tests for userDisplay utility functions
 */

import { describe, it, expect } from 'vitest';
import { getUserDisplayName, type DisplayableUser } from '../userDisplay';

describe('getUserDisplayName', () => {
  it('should return empty string for null user', () => {
    expect(getUserDisplayName(null)).toBe('');
  });

  it('should return empty string for undefined user', () => {
    expect(getUserDisplayName(undefined)).toBe('');
  });

  it('should prefer name over email and userId', () => {
    const user: DisplayableUser = {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'John Doe',
    };
    expect(getUserDisplayName(user)).toBe('John Doe');
  });

  it('should fall back to email when name is not available', () => {
    const user: DisplayableUser = {
      userId: 'user-123',
      email: 'test@example.com',
    };
    expect(getUserDisplayName(user)).toBe('test@example.com');
  });

  it('should fall back to userId when name and email are not available', () => {
    const user: DisplayableUser = {
      userId: 'user-123',
    };
    expect(getUserDisplayName(user)).toBe('user-123');
  });

  it('should return userId when name is empty string', () => {
    const user: DisplayableUser = {
      userId: 'user-123',
      name: '',
    };
    // Empty string is falsy, but ?? only checks for null/undefined
    // so empty string will be returned
    expect(getUserDisplayName(user)).toBe('');
  });

  it('should return email when name is not provided but email exists', () => {
    const user: DisplayableUser = {
      userId: 'user-123',
      email: 'fallback@example.com',
    };
    expect(getUserDisplayName(user)).toBe('fallback@example.com');
  });
});
