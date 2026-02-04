/**
 * Utility functions for displaying user information
 */

/** User object with optional display fields */
export interface DisplayableUser {
  userId: string;
  name?: string;
  email?: string;
}

/**
 * Gets the display name for a user, preferring name > email > userId
 * @param user - The user object to get display name from
 * @returns The best available display name for the user
 */
export function getUserDisplayName(user: DisplayableUser | null | undefined): string {
  if (!user) {
    return '';
  }
  return user.name ?? user.email ?? user.userId;
}
