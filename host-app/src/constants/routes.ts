/**
 * Application route constants
 * Centralizes route paths for type safety and maintainability
 */

/** Application route paths */
export const ROUTES = {
  /** Home/root route - displays the main image page */
  HOME: '/',
  /** Login route - displays authentication flow */
  LOGIN: '/login',
} as const;

/** Descope flow identifiers */
export const DESCOPE_FLOWS = {
  /** Main sign-up or sign-in flow with tenant selection */
  SIGN_UP_OR_IN: 'sign-up-or-in-fullbay',
} as const;

/** Type for route paths */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
