# SDLC Plan: Replace AppSync API Key Auth with Descope OIDC JWT

## Status: Complete
## Created: 2026-02-01T00:00:00Z
## Last Updated: 2026-02-01T13:30:00Z

## Original Request
> 1. Make the appsync apis not use API keys, and instead use descope, following this doc: https://docs.descope.com/authorization/session-management/session-validation/oidc-jwt-authorizers/aws-app-sync
>
> 2. Update the s3_service code to pass the JWT in the authToken, as shown in the doc.

## Context

### Current State
- Three AppSync APIs: rebac-service-api, org-service-api, member-service-api
- All use `API_KEY` authentication type
- s3_service passes API keys via `x-api-key` header in all GraphQL requests
- Descope authentication already in place with session tokens available

### Target State (per Descope docs)
- AppSync APIs use `OPENID_CONNECT` authentication type
- OIDC Provider URL: `https://api.descope.com/P38a668rJn8AUs65nESCiJqendj6`
- Client ID: `P38a668rJn8AUs65nESCiJqendj6` (Descope Project ID)
- s3_service passes Descope session token via `Authorization` header

## Architecture Overview

### AppSync OIDC Configuration
Per the Descope documentation, AppSync needs:
1. **Authorization Type**: `OPENID_CONNECT`
2. **Provider URL/Issuer**: `https://api.descope.com/{ProjectID}`
3. **Client ID**: Descope Project ID (same as issuer suffix)

### Client-Side Changes
The s3_service GraphQL clients need to:
1. Get the Descope session token
2. Pass it in the `Authorization: Bearer {token}` header instead of `x-api-key`
3. Remove API key environment variables (no longer needed)

## Components

### Component 1: Terraform - AppSync OIDC Configuration
- **Type**: infrastructure
- **Technology**: Terraform
- **Status**: Complete
- **Files to Modify**:
  - `terraform/appsync_rebac.tf` - Change auth from API_KEY to OPENID_CONNECT
  - `terraform/appsync_org.tf` - Change auth from API_KEY to OPENID_CONNECT
  - `terraform/appsync_member.tf` - Change auth from API_KEY to OPENID_CONNECT
  - `terraform/variables.tf` - Add descope_project_id variable

**Changes Required**:
```hcl
# For each AppSync API:
resource "aws_appsync_graphql_api" "rebac" {
  name                = "rebac-service-api"
  authentication_type = "OPENID_CONNECT"

  openid_connect_config {
    issuer    = "https://api.descope.com/${var.descope_project_id}"
    client_id = var.descope_project_id
  }

  # ... rest of config
}

# Remove the aws_appsync_api_key resources
# Remove the api_key outputs
```

### Component 2: s3_service - JWT Authentication
- **Type**: frontend
- **Technology**: React/TypeScript
- **Status**: Complete
- **Files to Modify**:
  - `s3_service/src/services/appsyncClient.ts` - Pass JWT instead of API key
  - `s3_service/src/services/orgServiceClient.ts` - Pass JWT instead of API key
  - `s3_service/src/services/memberServiceClient.ts` - Pass JWT instead of API key
  - `s3_service/src/vite-env.d.ts` - Remove API key type definitions
  - `s3_service/.env` - Remove API key values
  - `s3_service/.env.example` - Remove API key placeholders

**Pattern for JWT-authenticated requests**:
```typescript
// Get session token from Descope SDK
import { getSessionToken } from '@descope/react-sdk';

// In execute method:
const sessionToken = getSessionToken();
const response = await fetch(this.apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,  // Changed from x-api-key
  },
  body: JSON.stringify({ query, variables }),
});
```

## Implementation Order

1. **Terraform Changes** - Update all three AppSync APIs to use OIDC auth
2. **s3_service Changes** - Update all three GraphQL clients to use JWT
3. **Environment Cleanup** - Remove API key environment variables
4. **Deploy & Test** - Apply Terraform, build and deploy s3_service

## Terraform Changes Detail

### appsync_rebac.tf Changes
- Line 69: Change `authentication_type = "API_KEY"` to `"OPENID_CONNECT"`
- Add `openid_connect_config` block after authentication_type
- Remove `aws_appsync_api_key.rebac` resource (lines 84-91)
- Remove `appsync_rebac_api_key` output (lines 301-305)

### appsync_org.tf Changes
- Line 69: Change `authentication_type = "API_KEY"` to `"OPENID_CONNECT"`
- Add `openid_connect_config` block
- Remove `aws_appsync_api_key.org` resource
- Remove `appsync_org_api_key` output

### appsync_member.tf Changes
- Line 69: Change `authentication_type = "API_KEY"` to `"OPENID_CONNECT"`
- Add `openid_connect_config` block
- Remove `aws_appsync_api_key.member` resource
- Remove `appsync_member_api_key` output

### variables.tf Addition
```hcl
variable "descope_project_id" {
  description = "Descope Project ID for OIDC authentication"
  type        = string
  default     = "P38a668rJn8AUs65nESCiJqendj6"
}
```

## s3_service Changes Detail

### Key Challenge: Getting Session Token
The `getSessionToken()` function from `@descope/react-sdk` requires being in a React context. However, the AppSync clients are instantiated as module-level singletons.

**Solution**: Modify the client classes to accept a token getter function, or refactor to get token at call time.

### appsyncClient.ts Changes
1. Remove `APPSYNC_API_KEY` constant
2. Modify constructor to not require API key
3. Modify `execute()` to accept session token and use `Authorization` header
4. Update all public methods to require session token parameter, or use a token provider pattern

### orgServiceClient.ts Changes
1. Remove `APPSYNC_ORG_KEY` constant
2. Modify constructor and execute methods similarly

### memberServiceClient.ts Changes
1. Remove `APPSYNC_MEMBER_KEY` constant
2. Modify constructor and execute methods similarly

## Commits
- [x] Update Terraform AppSync configs to use OIDC authentication
- [x] Update s3_service to pass JWT instead of API keys

## Current Phase
**Phase**: Complete
**All Changes Applied**:
- Terraform: AppSync APIs updated from API_KEY to OPENID_CONNECT authentication
- s3_service: All GraphQL clients updated to use Descope JWT tokens
- Deployed: s3_service deployed to S3/CloudFront

## Changes Made

### Terraform Files Modified:
- `terraform/variables.tf` - Added `descope_project_id` variable
- `terraform/appsync_rebac.tf` - Changed to OIDC auth, removed API key
- `terraform/appsync_org.tf` - Changed to OIDC auth, removed API key
- `terraform/appsync_member.tf` - Changed to OIDC auth, removed API key

### s3_service Files Modified:
- `src/services/appsyncClient.ts` - Uses `getSessionToken()` with Authorization header
- `src/services/orgServiceClient.ts` - Uses `getSessionToken()` with Authorization header
- `src/services/memberServiceClient.ts` - Uses `getSessionToken()` with Authorization header
- `src/vite-env.d.ts` - Removed API key type definitions
- `.env` - Removed API key values
- `.env.example` - Removed API key placeholders
- `src/services/__tests__/orgServiceClient.test.ts` - Updated tests to mock `getSessionToken`
- `src/services/__tests__/memberServiceClient.test.ts` - Updated tests to mock `getSessionToken`

## Error Log
None
