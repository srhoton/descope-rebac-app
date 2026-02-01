/**
 * Auth Token Provider
 *
 * Bridges React's useSession hook with non-React service clients.
 * The token getter is set from within the React tree (AuthTokenBridge in App.tsx)
 * where the Descope context is available.
 */

type TokenGetter = () => string | undefined;

let tokenGetter: TokenGetter | null = null;

/**
 * Sets the token getter function. Called from React components
 * that have access to Descope's useSession hook.
 */
export function setTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter;
}

/**
 * Gets the current session token.
 * Returns undefined if no token getter is set or no token is available.
 */
export function getAuthToken(): string | undefined {
  if (!tokenGetter) {
    return undefined;
  }
  return tokenGetter();
}
