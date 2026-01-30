/**
 * GraphQL client for Organization Service AppSync API
 */

import type { PaginatedTenants } from '../types/sharing';

const APPSYNC_ORG_URL = import.meta.env['VITE_APPSYNC_ORG_ENDPOINT'] as string;
const APPSYNC_ORG_KEY = import.meta.env['VITE_APPSYNC_ORG_API_KEY'] as string;

if (!APPSYNC_ORG_URL || !APPSYNC_ORG_KEY) {
  throw new Error('Org Service AppSync configuration is missing from environment variables');
}

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
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(apiUrl = APPSYNC_ORG_URL, apiKey = APPSYNC_ORG_KEY) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Executes a GraphQL query
   */
  private async execute<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
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
