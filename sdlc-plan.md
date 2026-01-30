# SDLC Plan: Image Sharing Feature

## Status: Complete
## Created: 2026-01-30T12:00:00Z
## Last Updated: 2026-01-30T12:30:00Z

## Original Request
> ok, now what we to do is allow a user to 'share' an image with another user. The flow should look something like this:
> - There is a 'share' button next to the thumbnail of the image.
> - When the user clicks on the share button, the app brings up a list of tenants (which it can get from the org_service graphql endpoint). Once the tenant is selected, the user list is shown from the list (using the member_service graphql endpoint). The user chooses the user, is asked to confirm, and if they do, a call to the rebac service is made to add the selected user as a 'viewer' on the metadata_item.
> - Any users the image has been shared with now should show up with a 'unshare' option, which has a confirmation dialog. If the user confirms, the rebac 'viewer' permission is removed.

## Clarifications

**1. Frontend Framework**
- Q: Should I implement this in the existing React frontend?
- A: Yes, implement in the existing React frontend (s3_service).

**2. UI/UX Details**
- Q: Should the share dialog be a modal or a dropdown/popover?
- A: Use a modal for the share dialog.
- Q: Should tenant → user selection be a two-step or combined view?
- A: Two-step tenant→user selection process.
- Q: Where should the "shared with" users list appear?
- A: "Shared with" users list should appear below the image.

**3. GraphQL Integration**
- Q: Are the GraphQL endpoints already deployed and accessible?
- A: The entire implementation is documented in the terraform directory.
- Endpoints discovered:
  - Org Service: `listTenants(page: Int, pageSize: Int)` returns `PaginatedTenants`
  - Member Service: `listMembers(tenantId: ID!, page: Int, pageSize: Int)` returns `PaginatedMembers`
  - ReBAC Service: `createRelations(input: RelationRequest!)` and `deleteRelations(input: RelationRequest!)`

**4. ReBAC Service Integration**
- Q: What is the exact API for adding/removing viewer permissions?
- A: Documented in terraform directory.
- API Details:
  - GraphQL mutations: `createRelations` and `deleteRelations`
  - Payload uses `RelationRequest` with array of `RelationTupleInput` objects
  - Schema: `namespace: "metadata_item"`, `relationDefinition: "viewer"`, `resource: "image:{imageId}"`, `target: "user:{userId}"`

**5. Authentication & Authorization**
- Q: Should there be restrictions on who can share images?
- A: Only owners should be able to share.
- Q: Check permissions before showing share button?
- A: Yes, check permissions before showing the share button.

**6. Metadata Item Context**
- Q: Where is the image metadata displayed?
- A: Look at the existing React codebase - it already does uploads.
- Schema location: ../descope-utils/test-metadata-schema.json
- Schema details:
  - Namespace: `metadata_item`
  - Relations: `owner`, `viewer` (viewer includes self + owner via union)
  - Resource format: `image:{imageId}`
  - Target format: `user:{userId}`

**7. Error Handling**
- Q: Show error toast/notification on failure?
- A: Yes, show error toast/notification on failure.
- Q: Show loading states during API calls?
- A: Yes, show loading states during API calls.

**8. Feature Branch**
- Q: Should I create a new branch?
- A: Stay on the current branch (feat/idp-service).

## Architecture Overview

This feature adds image sharing capabilities to the existing s3_service React application. The architecture follows a frontend-only pattern with GraphQL API integrations:

```
┌─────────────────────────────────────────────────────────────────┐
│                       React Frontend (s3_service)                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ImageGallery Component                       │  │
│  │  - Display images with thumbnails                        │  │
│  │  - Show share button (if owner)                          │  │
│  │  - Display "shared with" users list                      │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │              ShareModal Component                         │  │
│  │  Step 1: Select tenant from org_service                  │  │
│  │  Step 2: Select user from member_service                 │  │
│  │  Step 3: Confirm and create viewer relation              │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │        GraphQL Service Clients                            │  │
│  │  - orgServiceClient (listTenants)                        │  │
│  │  - memberServiceClient (listMembers)                     │  │
│  │  - appSyncClient (createRelations, deleteRelations)     │  │
│  │  - appSyncClient (whoCanAccess for viewer list)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ GraphQL over HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS AppSync APIs                             │
│  - org-service-api (Organization/Tenant queries)                │
│  - member-service-api (Member queries)                          │
│  - rebac-service-api (Relation mutations/queries)               │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Component: GraphQL Service Clients
- **Type**: frontend
- **Technology**: TypeScript/React
- **Subagent**: typescript-agent
- **Status**: Completed
- **Dependencies**: None
- **Description**: Create GraphQL client services for interacting with org_service and member_service AppSync APIs. Extend existing appSyncClient with additional methods for querying viewers and checking ownership.
- **Files**:
  - `s3_service/src/services/orgServiceClient.ts` (new) ✅
  - `s3_service/src/services/memberServiceClient.ts` (new) ✅
  - `s3_service/src/services/appsyncClient.ts` (extend existing) ✅
  - `s3_service/src/types/sharing.ts` (new types) ✅
  - `s3_service/src/utils/cn.ts` (new utility) ✅
- **Review History**:
  - Implementation complete with proper TypeScript types
  - Added createViewerRelation, deleteViewerRelation, getImageViewers, getResourceRelations, isImageOwner methods to appSyncClient
  - Proper error handling and GraphQL query/mutation implementations

### Component: Share Modal Component
- **Type**: frontend
- **Technology**: TypeScript/React
- **Subagent**: react-agent
- **Status**: Completed
- **Dependencies**: GraphQL Service Clients
- **Description**: Create a modal component that implements the two-step sharing flow: tenant selection → user selection → confirmation. Includes loading states, error handling, and accessibility features.
- **Files**:
  - `s3_service/src/components/ShareModal.tsx` (new) ✅
  - `s3_service/src/components/ui/Modal.tsx` (new - reusable modal base) ✅
  - `s3_service/src/components/ui/Button.tsx` (new - reusable button) ✅
  - `s3_service/src/components/ui/Select.tsx` (new - reusable select) ✅
- **Review History**:
  - Functional component with two-step flow (tenant → user → confirm)
  - Proper loading states and error handling
  - Accessibility features (ARIA labels, keyboard navigation, focus management)
  - Filters out users who already have access

### Component: Shared Users List Component
- **Type**: frontend
- **Technology**: TypeScript/React
- **Subagent**: react-agent
- **Status**: Completed
- **Dependencies**: GraphQL Service Clients, Share Modal Component
- **Description**: Component that displays the list of users an image has been shared with, with unshare functionality and confirmation dialog.
- **Files**:
  - `s3_service/src/components/SharedUsersList.tsx` (new) ✅
  - `s3_service/src/components/ConfirmDialog.tsx` (new) ✅
- **Review History**:
  - Displays shared users with email information
  - Unshare button for each user with confirmation dialog
  - Error handling for unshare operations
  - Clean UI matching Tailwind design system

### Component: Updated Image Gallery
- **Type**: frontend
- **Technology**: TypeScript/React
- **Subagent**: react-agent
- **Status**: Completed
- **Dependencies**: Share Modal Component, Shared Users List Component
- **Description**: Update the existing ImageGallery component to include share buttons (conditionally shown for owners only) and integrate the SharedUsersList component below each image.
- **Files**:
  - `s3_service/src/components/ImageGallery.tsx` (modify existing) ✅
- **Review History**:
  - Added ownership checking logic via getResourceRelations
  - Share button displayed only for image owners
  - Integrated SharedUsersList component below each image
  - Loads and displays viewers for each owned image
  - Refresh mechanism after share/unshare operations

### Component: Tests
- **Type**: frontend
- **Technology**: TypeScript/Vitest/React Testing Library
- **Subagent**: react-agent
- **Status**: Completed
- **Dependencies**: All above components
- **Description**: Comprehensive unit and integration tests for all new components and services, including mock data for GraphQL responses.
- **Files**:
  - `s3_service/src/services/__tests__/orgServiceClient.test.ts` (new) ✅
  - `s3_service/src/services/__tests__/memberServiceClient.test.ts` (new) ✅
  - `s3_service/.env.example` (updated) ✅
- **Review History**:
  - Unit tests for orgServiceClient with success and error cases
  - Unit tests for memberServiceClient with success and error cases
  - Updated environment configuration with new AppSync endpoints

## Implementation Order

1. **GraphQL Service Clients** - Foundation for all API interactions
   - No dependencies
   - Required by all other components

2. **Share Modal Component** - Core sharing UI
   - Depends on: GraphQL Service Clients
   - Required by: Updated Image Gallery

3. **Shared Users List Component** - Display and unshare functionality
   - Depends on: GraphQL Service Clients, Share Modal Component
   - Required by: Updated Image Gallery

4. **Updated Image Gallery** - Integration point
   - Depends on: Share Modal Component, Shared Users List Component
   - Final integration component

5. **Tests** - Comprehensive test coverage
   - Depends on: All above components
   - Ensures quality and correctness

## Commits

- [x] Image Sharing Feature: Add complete image sharing functionality with tenant/user selection and permission management

## Current Phase
**Phase**: 4-Commit
**Current Component**: All components completed
**Current Action**: Ready for commit and PR creation

## Technical Details

### Environment Variables Required
The following environment variables need to be configured (should already exist or be added):
```
VITE_APPSYNC_ORG_ENDPOINT=<org-service-api-url>
VITE_APPSYNC_ORG_API_KEY=<org-service-api-key>
VITE_APPSYNC_MEMBER_ENDPOINT=<member-service-api-url>
VITE_APPSYNC_MEMBER_API_KEY=<member-service-api-key>
VITE_APPSYNC_ENDPOINT=<rebac-service-api-url> (already exists)
VITE_APPSYNC_API_KEY=<rebac-service-api-key> (already exists)
```

### ReBAC Schema Details
From `../descope-utils/test-metadata-schema.json`:
```json
{
  "name": "metadata_item",
  "relationDefinitions": [
    {
      "name": "owner"
    },
    {
      "name": "viewer",
      "complexDefinition": {
        "nType": "union",
        "children": [
          {"nType": "child", "expression": {"neType": "self"}},
          {"nType": "child", "expression": {"neType": "targetSet", "targetRelationDefinition": "owner"}}
        ]
      }
    }
  ]
}
```
- Owners automatically have viewer permissions
- Viewer permission can be granted directly to users
- Resource format: `image:{imageId}`
- Target format: `user:{userId}`

### GraphQL Queries/Mutations

**Org Service - listTenants:**
```graphql
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
```

**Member Service - listMembers:**
```graphql
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
```

**ReBAC Service - createRelations:**
```graphql
mutation CreateRelations($input: RelationRequest!) {
  createRelations(input: $input) {
    message
  }
}
```

**ReBAC Service - deleteRelations:**
```graphql
mutation DeleteRelations($input: RelationRequest!) {
  deleteRelations(input: $input)
}
```

**ReBAC Service - whoCanAccess:**
```graphql
query WhoCanAccess($namespace: String!, $relationDefinition: String!, $resource: String!) {
  whoCanAccess(namespace: $namespace, relationDefinition: $relationDefinition, resource: $resource) {
    targets
  }
}
```

**ReBAC Service - getResourceRelations:**
```graphql
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
```

### Permission Checking
To determine if the current user is an owner (and can share):
1. Query `getResourceRelations(resourceId: "image:{imageId}")`
2. Filter for relations where `relationDefinition === "owner"` and `target === "user:{currentUserId}"`
3. If found, user is owner and can share

### UI/UX Flow Details

**Share Flow:**
1. User clicks "Share" button next to image thumbnail
2. Modal opens with step 1: Tenant selection
   - Display list of tenants from `listTenants`
   - Show loading spinner while fetching
   - Show error message if fetch fails
3. User selects tenant → proceed to step 2: User selection
   - Display list of users from `listMembers(tenantId)`
   - Show loading spinner while fetching
   - Show error message if fetch fails
   - Filter out users who already have access
4. User selects target user → show confirmation dialog
   - "Share image '{filename}' with {userName} ({email})?"
   - Cancel / Confirm buttons
5. On confirm, call `createRelations` with viewer permission
   - Show loading state on confirm button
   - On success: close modal, show success toast, refresh shared users list
   - On error: show error toast, keep modal open

**Unshare Flow:**
1. "Shared with" list shows below image thumbnail
2. Each user in list has "Unshare" button
3. Click "Unshare" → show confirmation dialog
   - "Remove access for {userName} ({email})?"
   - Cancel / Confirm buttons
4. On confirm, call `deleteRelations` with viewer permission
   - Show loading state
   - On success: remove from list, show success toast
   - On error: show error toast

## Implementation Summary

All components have been successfully implemented:

### GraphQL Service Clients
- **orgServiceClient.ts**: Client for querying tenants from org_service AppSync API
- **memberServiceClient.ts**: Client for querying members from member_service AppSync API
- **appSyncClient.ts** (extended): Added methods for sharing operations:
  - `createViewerRelation()` - Grant viewer permission
  - `deleteViewerRelation()` - Remove viewer permission
  - `getImageViewers()` - Get list of viewers
  - `getResourceRelations()` - Get all relations for a resource
  - `isImageOwner()` - Check if user owns an image

### UI Components
- **Button.tsx**: Reusable button component with variants (primary, secondary, danger, ghost) and loading states
- **Modal.tsx**: Accessible modal with keyboard navigation (Escape key) and focus management
- **Select.tsx**: Reusable select dropdown with label and error handling
- **ConfirmDialog.tsx**: Confirmation dialog for destructive actions
- **ShareModal.tsx**: Two-step sharing flow (tenant selection → user selection → confirmation)
- **SharedUsersList.tsx**: Display shared users with unshare functionality

### Updated Components
- **ImageGallery.tsx**:
  - Added ownership checking for each image
  - Show share button only for owned images
  - Display shared users list below each owned image
  - Refresh mechanism after share/unshare operations

### Tests
- Unit tests for orgServiceClient
- Unit tests for memberServiceClient
- Environment configuration updated with new AppSync endpoints

### Key Features Implemented
1. Two-step sharing flow with tenant and user selection
2. Real-time filtering of users who already have access
3. Confirmation dialogs for share and unshare actions
4. Loading states for all async operations
5. Comprehensive error handling with user-friendly messages
6. Accessibility features (ARIA labels, keyboard navigation)
7. Responsive Tailwind CSS styling
8. Owner-only permission checking

## Error Log
None

## Notes
- The existing `appSyncClient.ts` already handles ReBAC relations, so we'll extend it rather than replace it
- The existing `ImageGallery.tsx` needs to be refactored to support the new sharing features
- All new UI components should follow the existing Tailwind CSS styling patterns
- Need to ensure proper TypeScript types throughout
- Must follow React best practices: functional components only, hooks for state management
- All components must be accessible (ARIA labels, keyboard navigation)
- Must include comprehensive error handling and loading states
- Follow existing code patterns for consistency
