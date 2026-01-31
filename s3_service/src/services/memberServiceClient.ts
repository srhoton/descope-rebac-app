/**
 * GraphQL client for Member Service AppSync API
 */

import type { PaginatedMembers, UserInfo } from '../types/sharing';

const APPSYNC_MEMBER_URL = import.meta.env['VITE_APPSYNC_MEMBER_ENDPOINT'] as string | undefined;
const APPSYNC_MEMBER_KEY = import.meta.env['VITE_APPSYNC_MEMBER_API_KEY'] as string | undefined;

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
 */
export class MemberServiceClient {
  private readonly apiUrl: string | undefined;
  private readonly apiKey: string | undefined;

  constructor(apiUrl = APPSYNC_MEMBER_URL, apiKey = APPSYNC_MEMBER_KEY) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Validates that configuration is present
   */
  private validateConfig(): { apiUrl: string; apiKey: string } {
    if (!this.apiUrl || !this.apiKey) {
      throw new Error(
        'Member Service AppSync configuration is missing. ' +
        'Set VITE_APPSYNC_MEMBER_ENDPOINT and VITE_APPSYNC_MEMBER_API_KEY environment variables to enable sharing.'
      );
    }
    return { apiUrl: this.apiUrl, apiKey: this.apiKey };
  }

  /**
   * Executes a GraphQL query
   */
  private async execute<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T> {
    const { apiUrl, apiKey } = this.validateConfig();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
    return Boolean(this.apiUrl && this.apiKey);
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
