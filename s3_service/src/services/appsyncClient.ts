/**
 * AppSync GraphQL client for ReBaC service
 */

import type { RelationTuple } from '../types/image';

const APPSYNC_API_URL = import.meta.env['VITE_APPSYNC_ENDPOINT'] as string;
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
 * Mutation to delete relations
 */
const DELETE_RELATIONS_MUTATION = `
  mutation DeleteRelations($input: RelationRequest!) {
    deleteRelations(input: $input)
  }
`;

/**
 * Query to get who can access a resource
 */
const WHO_CAN_ACCESS_QUERY = `
  query WhoCanAccess($namespace: String!, $relationDefinition: String!, $resource: String!) {
    whoCanAccess(namespace: $namespace, relationDefinition: $relationDefinition, resource: $resource) {
      targets
    }
  }
`;

/**
 * Query to get all relations for a resource
 */
const GET_RESOURCE_RELATIONS_QUERY = `
  query GetResourceRelations($resourceId: String!) {
    getResourceRelations(resourceId: $resourceId) {
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
   * Filters relations to get only image resources the user can access (owner or viewer)
   */
  filterImageRelations(relations: RelationTuple[]): string[] {
    return relations
      .filter(
        (rel) =>
          rel.namespace === 'metadata_item' &&
          (rel.relationDefinition === 'owner' || rel.relationDefinition === 'viewer') &&
          rel.resource.startsWith('image:')
      )
      .map((rel) => rel.resource.replace('image:', ''));
  }

  /**
   * Gets image access info including owner userId for each image
   * Returns a map of imageId -> ownerUserId
   */
  async getImageAccessInfo(
    userId: string,
    relations: RelationTuple[]
  ): Promise<Map<string, string>> {
    const imageOwnerMap = new Map<string, string>();

    const imageRelations = relations.filter(
      (rel) =>
        rel.namespace === 'metadata_item' &&
        (rel.relationDefinition === 'owner' || rel.relationDefinition === 'viewer') &&
        rel.resource.startsWith('image:')
    );

    for (const rel of imageRelations) {
      const imageId = rel.resource.replace('image:', '');

      if (rel.relationDefinition === 'owner') {
        // User owns this image, use their userId
        imageOwnerMap.set(imageId, userId);
      } else {
        // User is a viewer, need to find the owner
        try {
          const resourceRelations = await this.getResourceRelations(rel.resource);
          const ownerRelation = resourceRelations.relations.find(
            (r) => r.relationDefinition === 'owner'
          );
          if (ownerRelation) {
            const ownerId = ownerRelation.target.replace('user:', '');
            imageOwnerMap.set(imageId, ownerId);
          }
        } catch (error) {
          console.error(`Failed to get owner for image ${imageId}:`, error);
        }
      }
    }

    return imageOwnerMap;
  }

  /**
   * Creates a viewer relation for an image
   */
  async createViewerRelation(
    imageId: string,
    targetUserId: string
  ): Promise<{ message: string }> {
    const relation: RelationTuple = {
      namespace: 'metadata_item',
      relationDefinition: 'viewer',
      resource: `image:${imageId}`,
      target: `user:${targetUserId}`,
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
   * Deletes a viewer relation for an image
   */
  async deleteViewerRelation(
    imageId: string,
    targetUserId: string
  ): Promise<boolean> {
    const relation: RelationTuple = {
      namespace: 'metadata_item',
      relationDefinition: 'viewer',
      resource: `image:${imageId}`,
      target: `user:${targetUserId}`,
    };

    const result = await this.execute<{
      deleteRelations: boolean;
    }>(DELETE_RELATIONS_MUTATION, {
      input: {
        relations: [relation],
      },
    });

    return result.deleteRelations;
  }

  /**
   * Gets all users who can view an image (viewers, not owners)
   */
  async getImageViewers(imageId: string): Promise<string[]> {
    const result = await this.execute<{
      whoCanAccess: { targets: string[] };
    }>(WHO_CAN_ACCESS_QUERY, {
      namespace: 'metadata_item',
      relationDefinition: 'viewer',
      resource: `image:${imageId}`,
    });

    // Filter out owner targets - we only want explicit viewers
    const relations = await this.getResourceRelations(`image:${imageId}`);
    const ownerTargets = relations.relations
      .filter((rel) => rel.relationDefinition === 'owner')
      .map((rel) => rel.target);

    return result.whoCanAccess.targets.filter(
      (target) => !ownerTargets.includes(target)
    );
  }

  /**
   * Gets all relations for a resource
   */
  async getResourceRelations(
    resourceId: string
  ): Promise<{ relations: RelationTuple[] }> {
    const result = await this.execute<{
      getResourceRelations: { relations: RelationTuple[] };
    }>(GET_RESOURCE_RELATIONS_QUERY, { resourceId });

    return result.getResourceRelations;
  }

  /**
   * Checks if a user is the owner of an image
   */
  async isImageOwner(imageId: string, userId: string): Promise<boolean> {
    const result = await this.getResourceRelations(`image:${imageId}`);
    const targetId = `user:${userId}`;

    return result.relations.some(
      (rel) =>
        rel.relationDefinition === 'owner' &&
        rel.target === targetId
    );
  }
}

export const appSyncClient = new AppSyncClient();
