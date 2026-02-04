import { describe, it, expect, beforeEach, vi } from 'vitest';

// Reset module state before each test by re-importing
let setTokenGetter: typeof import('../authTokenProvider').setTokenGetter;
let getAuthToken: typeof import('../authTokenProvider').getAuthToken;

describe('authTokenProvider', () => {
  beforeEach(async () => {
    // Reset module to clear state between tests
    vi.resetModules();
    const module = await import('../authTokenProvider');
    setTokenGetter = module.setTokenGetter;
    getAuthToken = module.getAuthToken;
  });

  describe('setTokenGetter', () => {
    it('should set the token getter function', (): void => {
      const mockGetter = vi.fn().mockReturnValue('test-token');

      setTokenGetter(mockGetter);
      const result = getAuthToken();

      expect(result).toBe('test-token');
      expect(mockGetter).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuthToken', () => {
    it('should return undefined when no token getter is set', (): void => {
      const result = getAuthToken();

      expect(result).toBeUndefined();
    });

    it('should return the token from the getter when set', (): void => {
      const expectedToken = 'my-session-token';
      const mockGetter = vi.fn().mockReturnValue(expectedToken);

      setTokenGetter(mockGetter);
      const result = getAuthToken();

      expect(result).toBe(expectedToken);
    });

    it('should return undefined when getter returns undefined', (): void => {
      const mockGetter = vi.fn().mockReturnValue(undefined);

      setTokenGetter(mockGetter);
      const result = getAuthToken();

      expect(result).toBeUndefined();
    });

    it('should call the getter function each time getAuthToken is called', (): void => {
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

    it('should allow updating the token getter', (): void => {
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
