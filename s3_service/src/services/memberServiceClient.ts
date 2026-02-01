/**
 * GraphQL client for Member Service AppSync API
 * Uses Descope OIDC JWT authentication
 */

import { getAuthToken } from './authTokenProvider';
import type { PaginatedMembers, UserInfo } from '../types/sharing';

const APPSYNC_MEMBER_URL = import.meta.env['VITE_APPSYNC_MEMBER_ENDPOINT'];

/**
 * Query to list members in a tenant
 */
const LIST_MEMBERS_QUERY = `
  query ListMembers($tenantId: ID!, $page: Int, $pageSize: Int) {
    listMembers(tenantId: $tenantId, page: $page, pageSize: $pageSize) {
      items {
        loginId
        name
        email
        phone
        tenantId
      }
      page
      pageSize
      totalItems
      totalPages
    }
  }
`;

/**
 * Query to get user by Descope userId
 */
const GET_USER_BY_ID_QUERY = `
  query GetUserById($userId: String!) {
    getUserById(userId: $userId) {
      userId
      name
      email
    }
  }
`;

/**
 * Client for interacting with the Member Service AppSync API
 * Uses Descope OIDC JWT authentication
 */
export class MemberServiceClient {
  private readonly apiUrl: string | undefined;

  constructor(apiUrl = APPSYNC_MEMBER_URL) {
    this.apiUrl = apiUrl;
  }

  /**
   * Validates that configuration is present
   */
  private validateConfig(): { apiUrl: string } {
    if (!this.apiUrl) {
      throw new Error(
        'Member Service AppSync configuration is missing. ' +
        'Set VITE_APPSYNC_MEMBER_ENDPOINT environment variable to enable sharing.'
      );
    }
    return { apiUrl: this.apiUrl };
  }

  /**
   * Executes a GraphQL query
   * Uses Descope session token for authentication
   */
  private async execute<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T> {
    const { apiUrl } = this.validateConfig();

    const sessionToken = getAuthToken();
    if (!sessionToken) {
      throw new Error('No session token available. User must be authenticated.');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Member Service request failed: ${response.statusText}`);
    }

    const result = (await response.json()) as {
      data?: T;
      errors?: Array<{ message: string }>;
    };

    if (result.errors && result.errors.length > 0) {
      const firstError = result.errors[0];
      if (firstError) {
        throw new Error(`GraphQL error: ${firstError.message}`);
      }
    }

    if (!result.data) {
      throw new Error('No data returned from Member Service');
    }

    return result.data;
  }

  /**
   * Checks if the member service is configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiUrl);
  }

  /**
   * Lists all members in a tenant with pagination
   */
  async listMembers(
    tenantId: string,
    page = 0,
    pageSize = 20
  ): Promise<PaginatedMembers> {
    const result = await this.execute<{
      listMembers: PaginatedMembers;
    }>(LIST_MEMBERS_QUERY, { tenantId, page, pageSize });

    return result.listMembers;
  }

  /**
   * Gets user info by Descope userId
   */
  async getUserById(userId: string): Promise<UserInfo | null> {
    const result = await this.execute<{
      getUserById: UserInfo | null;
    }>(GET_USER_BY_ID_QUERY, { userId });

    return result.getUserById;
  }
}

export const memberServiceClient = new MemberServiceClient();
