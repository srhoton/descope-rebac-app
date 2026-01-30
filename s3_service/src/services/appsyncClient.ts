/**
 * AppSync GraphQL client for ReBaC service
 */

import type { RelationTuple } from '../types/image';

const APPSYNC_API_URL = import.meta.env['VITE_APPSYNC_API_URL'] as string;
const APPSYNC_API_KEY = import.meta.env['VITE_APPSYNC_API_KEY'] as string;

if (!APPSYNC_API_URL || !APPSYNC_API_KEY) {
  throw new Error('AppSync configuration is missing from environment variables');
}

/**
 * Query to get all relations for a specific target (user)
 */
const GET_TARGET_ACCESS_QUERY = `
  query GetTargetAccess($targetId: String!) {
    getTargetAccess(targetId: $targetId) {
      relations {
        namespace
        relationDefinition
        resource
        target
      }
    }
  }
`;

/**
 * Mutation to create new relations
 */
const CREATE_RELATIONS_MUTATION = `
  mutation CreateRelations($input: RelationRequest!) {
    createRelations(input: $input) {
      message
    }
  }
`;

/**
 * AppSync client for interacting with ReBaC service
 */
export class AppSyncClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(apiUrl = APPSYNC_API_URL, apiKey = APPSYNC_API_KEY) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Executes a GraphQL query or mutation
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
      throw new Error(`AppSync request failed: ${response.statusText}`);
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
      throw new Error('No data returned from AppSync');
    }

    return result.data;
  }

  /**
   * Gets all resources accessible by a user
   */
  async getTargetAccess(
    userId: string
  ): Promise<{ relations: RelationTuple[] }> {
    const targetId = `user:${userId}`;
    const result = await this.execute<{
      getTargetAccess: { relations: RelationTuple[] };
    }>(GET_TARGET_ACCESS_QUERY, { targetId });

    return result.getTargetAccess;
  }

  /**
   * Creates ownership relation for an image
   */
  async createImageOwnership(
    imageId: string,
    userId: string
  ): Promise<{ message: string }> {
    const relation: RelationTuple = {
      namespace: 'metadata_item',
      relationDefinition: 'owner',
      resource: `image:${imageId}`,
      target: `user:${userId}`,
    };

    const result = await this.execute<{
      createRelations: { message: string };
    }>(CREATE_RELATIONS_MUTATION, {
      input: {
        relations: [relation],
      },
    });

    return result.createRelations;
  }

  /**
   * Filters relations to get only image resources owned by the user
   */
  filterImageRelations(relations: RelationTuple[]): string[] {
    return relations
      .filter(
        (rel) =>
          rel.namespace === 'metadata_item' &&
          rel.relationDefinition === 'owner' &&
          rel.resource.startsWith('image:')
      )
      .map((rel) => rel.resource.replace('image:', ''));
  }
}

export const appSyncClient = new AppSyncClient();
