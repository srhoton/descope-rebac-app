/**
 * GraphQL client for Organization Service AppSync API
 */

import type { PaginatedTenants } from '../types/sharing';

const APPSYNC_ORG_URL = import.meta.env['VITE_APPSYNC_ORG_ENDPOINT'] as string | undefined;
const APPSYNC_ORG_KEY = import.meta.env['VITE_APPSYNC_ORG_API_KEY'] as string | undefined;

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
 */
export class OrgServiceClient {
  private readonly apiUrl: string | undefined;
  private readonly apiKey: string | undefined;

  constructor(apiUrl = APPSYNC_ORG_URL, apiKey = APPSYNC_ORG_KEY) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Validates that configuration is present
   */
  private validateConfig(): { apiUrl: string; apiKey: string } {
    if (!this.apiUrl || !this.apiKey) {
      throw new Error(
        'Org Service AppSync configuration is missing. ' +
        'Set VITE_APPSYNC_ORG_ENDPOINT and VITE_APPSYNC_ORG_API_KEY environment variables to enable sharing.'
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
    return Boolean(this.apiUrl && this.apiKey);
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
