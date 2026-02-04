/**
 * Auth Token Provider
 *
 * Bridges React's useSession hook with non-React service clients.
 * The token getter is set from within the React tree (AuthTokenBridge)
 * where the Descope context is available.
 *
 * Uses a global variable to ensure token is shared across all module instances
 * (important for Module Federation where internal and exposed modules may be different chunks).
 */

type TokenGetter = () => string | undefined;

// Use a global symbol key to ensure the same storage is used across module instances
const GLOBAL_TOKEN_KEY = '__s3_service_auth_token_getter__';

// Extend the Window interface to include our token getter
declare global {
  interface Window {
    [GLOBAL_TOKEN_KEY]?: TokenGetter;
  }
}

/**
 * Sets the token getter function. Called from React components
 * that have access to Descope's useSession hook.
 */
export function setTokenGetter(getter: TokenGetter): void {
  if (typeof window !== 'undefined') {
    window[GLOBAL_TOKEN_KEY] = getter;
  }
}

/**
 * Gets the current session token.
 * Returns undefined if no token getter is set or no token is available.
 */
export function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const getter = window[GLOBAL_TOKEN_KEY];
  if (!getter) {
    return undefined;
  }
  return getter();
}
