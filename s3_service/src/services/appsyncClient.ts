/**
 * AppSync GraphQL client for ReBaC service
 * Uses Descope OIDC JWT authentication
 */

import { getAuthToken } from './authTokenProvider';
import type { RelationTuple } from '../types/image';

const APPSYNC_API_URL = import.meta.env['VITE_APPSYNC_ENDPOINT'];

/**
 * Parsed viewer target with userId and tenantId
 */
interface ParsedViewerTarget {
  userId: string;
  tenantId: string;
}

/**
 * Parse a viewer target in format "user:{userId}#tenant:{tenantId}"
 * Returns null if the format doesn't match (legacy format without tenant)
 */
function parseViewerTarget(target: string): ParsedViewerTarget | null {
  const match = target.match(/^user:([^#]+)#tenant:(.+)$/);
  if (!match?.[1] || !match[2]) {
    return null;
  }
  return {
    userId: match[1],
    tenantId: match[2],
  };
}

/**
 * Build a viewer target string in format "user:{userId}#tenant:{tenantId}"
 */
function buildViewerTarget(userId: string, tenantId: string): string {
  return `user:${userId}#tenant:${tenantId}`;
}

if (!APPSYNC_API_URL) {
  throw new Error('VITE_APPSYNC_ENDPOINT is missing from environment variables');
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
 * Uses Descope OIDC JWT authentication
 */
export class AppSyncClient {
  private readonly apiUrl: string;

  constructor(apiUrl = APPSYNC_API_URL) {
    this.apiUrl = apiUrl;
  }

  /**
   * Executes a GraphQL query or mutation
   * Uses Descope session token for authentication
   */
  private async execute<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T> {
    const sessionToken = getAuthToken();
    if (!sessionToken) {
      throw new Error('No session token available. User must be authenticated.');
    }

    const response = await fetch(this.apiUrl, {
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
   * Gets all resources accessible by a user (owner relations only)
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
   * Gets all relations for a user in a specific tenant context.
   * This combines:
   * 1. Owner relations (target = user:{userId})
   * 2. Viewer relations for the current tenant (target = user:{userId}#tenant:{tenantId})
   */
  async getTargetAccessWithTenant(
    userId: string,
    tenantId: string
  ): Promise<{ relations: RelationTuple[] }> {
    // Query for owner relations (simple user target)
    const ownerTargetId = `user:${userId}`;
    const ownerResult = await this.execute<{
      getTargetAccess: { relations: RelationTuple[] };
    }>(GET_TARGET_ACCESS_QUERY, { targetId: ownerTargetId });

    // Query for viewer relations in the current tenant
    const viewerTargetId = buildViewerTarget(userId, tenantId);
    const viewerResult = await this.execute<{
      getTargetAccess: { relations: RelationTuple[] };
    }>(GET_TARGET_ACCESS_QUERY, { targetId: viewerTargetId });

    // Combine the results
    return {
      relations: [
        ...ownerResult.getTargetAccess.relations,
        ...viewerResult.getTargetAccess.relations,
      ],
    };
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
   * For viewer relations, only includes those scoped to the current tenant
   * Owner relations are included regardless of tenant (owners see their images everywhere)
   */
  filterImageRelations(relations: RelationTuple[], currentTenantId: string): string[] {
    return relations
      .filter((rel) => {
        if (rel.namespace !== 'metadata_item' || !rel.resource.startsWith('image:')) {
          return false;
        }

        if (rel.relationDefinition === 'owner') {
          // Owners see their images in all tenants
          return true;
        }

        if (rel.relationDefinition === 'viewer') {
          // Viewers only see images shared to their current tenant
          const parsed = parseViewerTarget(rel.target);
          // Skip legacy format (no tenant) - effectively "deletes" old shares
          if (!parsed) {
            return false;
          }
          return parsed.tenantId === currentTenantId;
        }

        return false;
      })
      .map((rel) => rel.resource.replace('image:', ''));
  }

  /**
   * Gets image access info including owner userId for each image
   * Returns a map of imageId -> ownerUserId
   * For viewer relations, only includes those scoped to the current tenant
   */
  async getImageAccessInfo(
    userId: string,
    relations: RelationTuple[],
    currentTenantId: string
  ): Promise<Map<string, string>> {
    const imageOwnerMap = new Map<string, string>();

    const imageRelations = relations.filter((rel) => {
      if (rel.namespace !== 'metadata_item' || !rel.resource.startsWith('image:')) {
        return false;
      }

      if (rel.relationDefinition === 'owner') {
        return true;
      }

      if (rel.relationDefinition === 'viewer') {
        // Only include viewer relations scoped to current tenant
        const parsed = parseViewerTarget(rel.target);
        // Skip legacy format (no tenant)
        if (!parsed) {
          return false;
        }
        return parsed.tenantId === currentTenantId;
      }

      return false;
    });

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
   * Creates a viewer relation for an image scoped to a specific tenant
   */
  async createViewerRelation(
    imageId: string,
    targetUserId: string,
    targetTenantId: string
  ): Promise<{ message: string }> {
    const relation: RelationTuple = {
      namespace: 'metadata_item',
      relationDefinition: 'viewer',
      resource: `image:${imageId}`,
      target: buildViewerTarget(targetUserId, targetTenantId),
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
   * Deletes a viewer relation for an image scoped to a specific tenant
   */
  async deleteViewerRelation(
    imageId: string,
    targetUserId: string,
    targetTenantId: string
  ): Promise<boolean> {
    const relation: RelationTuple = {
      namespace: 'metadata_item',
      relationDefinition: 'viewer',
      resource: `image:${imageId}`,
      target: buildViewerTarget(targetUserId, targetTenantId),
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
   * Gets all viewer relations for an image with parsed user and tenant info
   * Returns only tenant-scoped viewer relations (ignores legacy format)
   */
  async getImageViewers(imageId: string): Promise<Array<{ userId: string; tenantId: string }>> {
    const relations = await this.getResourceRelations(`image:${imageId}`);

    // Filter to viewer relations and parse the target
    const viewers: Array<{ userId: string; tenantId: string }> = [];

    for (const rel of relations.relations) {
      if (rel.relationDefinition !== 'viewer') {
        continue;
      }

      const parsed = parseViewerTarget(rel.target);
      // Skip legacy format (no tenant)
      if (!parsed) {
        continue;
      }

      viewers.push({
        userId: parsed.userId,
        tenantId: parsed.tenantId,
      });
    }

    return viewers;
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
