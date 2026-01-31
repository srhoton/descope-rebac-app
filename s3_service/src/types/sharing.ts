/**
 * Type definitions for image sharing functionality
 */

/**
 * Tenant information from org_service
 */
export interface Tenant {
  id: string;
  name: string;
}

/**
 * Paginated response for tenants
 */
export interface PaginatedTenants {
  items: Tenant[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Member information from member_service
 */
export interface Member {
  loginId: string;
  name?: string;
  email: string;
  phone?: string;
  tenantId: string;
}

/**
 * Paginated response for members
 */
export interface PaginatedMembers {
  items: Member[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * User who has been granted viewer access to an image
 */
export interface SharedUser {
  userId: string;
  email: string;
  name?: string;
}

/**
 * Basic user information returned by getUserById
 */
export interface UserInfo {
  userId: string;
  name?: string;
  email: string;
}
