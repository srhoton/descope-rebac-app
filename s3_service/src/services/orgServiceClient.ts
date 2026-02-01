/**
 * GraphQL client for Organization Service AppSync API
 * Uses Descope OIDC JWT authentication
 */

import { getAuthToken } from './authTokenProvider';
import type { PaginatedTenants } from '../types/sharing';

const APPSYNC_ORG_URL = import.meta.env['VITE_APPSYNC_ORG_ENDPOINT'];

/**
 * Query to list all tenants
 */
const LIST_TENANTS_QUERY = `
  query ListTenants($page: Int, $pageSize: Int) {
    listTenants(page: $page, pageSize: $pageSize) {
      items {
        id
        name
      }
      page
      pageSize
      totalItems
      totalPages
    }
  }
`;

/**
 * Client for interacting with the Organization Service AppSync API
 * Uses Descope OIDC JWT authentication
 */
export class OrgServiceClient {
  private readonly apiUrl: string | undefined;

  constructor(apiUrl = APPSYNC_ORG_URL) {
    this.apiUrl = apiUrl;
  }

  /**
   * Validates that configuration is present
   */
  private validateConfig(): { apiUrl: string } {
    if (!this.apiUrl) {
      throw new Error(
        'Org Service AppSync configuration is missing. ' +
        'Set VITE_APPSYNC_ORG_ENDPOINT environment variable to enable sharing.'
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
      throw new Error(`Org Service request failed: ${response.statusText}`);
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
      throw new Error('No data returned from Org Service');
    }

    return result.data;
  }

  /**
   * Checks if the org service is configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiUrl);
  }

  /**
   * Lists all tenants with pagination
   */
  async listTenants(
    page = 0,
    pageSize = 20
  ): Promise<PaginatedTenants> {
    const result = await this.execute<{
      listTenants: PaginatedTenants;
    }>(LIST_TENANTS_QUERY, { page, pageSize });

    return result.listTenants;
  }
}

export const orgServiceClient = new OrgServiceClient();
