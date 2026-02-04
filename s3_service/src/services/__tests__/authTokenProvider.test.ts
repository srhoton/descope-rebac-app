import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setTokenGetter, getAuthToken } from '../authTokenProvider';

const GLOBAL_TOKEN_KEY = '__s3_service_auth_token_getter__';

describe('authTokenProvider', () => {
  beforeEach(() => {
    // Clean up global state before each test
    delete (window as unknown as Record<string, unknown>)[GLOBAL_TOKEN_KEY];
  });

  describe('setTokenGetter', () => {
    it('should set the token getter on window when window is defined', () => {
      const mockGetter = vi.fn().mockReturnValue('test-token');

      setTokenGetter(mockGetter);

      expect(
        (window as unknown as Record<string, unknown>)[GLOBAL_TOKEN_KEY]
      ).toBe(mockGetter);
    });

    it('should not throw when window is defined', () => {
      const mockGetter = vi.fn();

      expect(() => setTokenGetter(mockGetter)).not.toThrow();
    });
  });

  describe('getAuthToken', () => {
    it('should return undefined when no token getter is set', () => {
      const result = getAuthToken();

      expect(result).toBeUndefined();
    });

    it('should return the token from the getter when set', () => {
      const expectedToken = 'my-session-token';
      const mockGetter = vi.fn().mockReturnValue(expectedToken);

      setTokenGetter(mockGetter);
      const result = getAuthToken();

      expect(result).toBe(expectedToken);
      expect(mockGetter).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when getter returns undefined', () => {
      const mockGetter = vi.fn().mockReturnValue(undefined);

      setTokenGetter(mockGetter);
      const result = getAuthToken();

      expect(result).toBeUndefined();
    });

    it('should call the getter function each time getAuthToken is called', () => {
      let callCount = 0;
      const mockGetter = vi.fn().mockImplementation(() => {
        callCount++;
        return `token-${callCount}`;
      });

      setTokenGetter(mockGetter);

      expect(getAuthToken()).toBe('token-1');
      expect(getAuthToken()).toBe('token-2');
      expect(getAuthToken()).toBe('token-3');
      expect(mockGetter).toHaveBeenCalledTimes(3);
    });

    it('should allow updating the token getter', () => {
      const firstGetter = vi.fn().mockReturnValue('first-token');
      const secondGetter = vi.fn().mockReturnValue('second-token');

      setTokenGetter(firstGetter);
      expect(getAuthToken()).toBe('first-token');

      setTokenGetter(secondGetter);
      expect(getAuthToken()).toBe('second-token');

      expect(firstGetter).toHaveBeenCalledTimes(1);
      expect(secondGetter).toHaveBeenCalledTimes(1);
    });
  });
});
