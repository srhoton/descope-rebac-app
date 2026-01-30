# AppSync GraphQL APIs for Descope Services

This directory contains Terraform configurations and GraphQL schemas for three AWS AppSync APIs that provide GraphQL interfaces to the Descope backend services.

## Architecture Overview

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Clients   │────▶│  AppSync APIs   │────▶│  ALB (HTTPS)│────▶│ Lambda Services  │
└─────────────┘     └─────────────────┘     └─────────────┘     └──────────────────┘
                     • Org Service API              │             • Org Service
                     • Member Service API           │             • Member Service
                     • ReBac Service API            │             • ReBac Service
```

## Files Created

### GraphQL Schemas
- `graphql/org_service.graphql` - Organization/Tenant management schema
- `graphql/member_service.graphql` - Member management schema
- `graphql/rebac_service.graphql` - Fine-grained authorization schema

### Terraform Configurations
- `appsync_org.tf` - Organization Service AppSync API
- `appsync_member.tf` - Member Service AppSync API
- `appsync_rebac.tf` - ReBac Service AppSync API

## Features

### Organization Service API
- **Queries:**
  - `listTenants(page: Int, pageSize: Int)` - List all tenants with pagination
  - `getTenant(tenantId: ID!)` - Get a specific tenant by ID

- **Mutations:**
  - `createTenant(input: TenantInput!)` - Create a new tenant
  - `updateTenant(tenantId: ID!, input: TenantInput!)` - Update a tenant
  - `deleteTenant(tenantId: ID!)` - Delete a tenant

### Member Service API
- **Queries:**
  - `listMembers(tenantId: ID!, page: Int, pageSize: Int)` - List all members in a tenant
  - `getMember(tenantId: ID!, loginId: String!)` - Get a specific member

- **Mutations:**
  - `createMember(tenantId: ID!, input: MemberInput!)` - Create a new member
  - `updateMember(tenantId: ID!, loginId: String!, input: MemberInput!)` - Update a member
  - `deleteMember(tenantId: ID!, loginId: String!)` - Delete a member

### ReBac Service API
- **Queries:**
  - `getResourceRelations(resourceId: String!)` - Get all relations for a resource
  - `getTargetAccess(targetId: String!)` - Get all resources a target can access
  - `whoCanAccess(namespace: String!, relationDefinition: String!, resource: String!)` - Query who can access a resource

- **Mutations:**
  - `createRelations(input: RelationRequest!)` - Create relation tuples
  - `deleteRelations(input: RelationRequest!)` - Delete relation tuples

## Deployment

### 1. Initialize Terraform (if not already done)
```bash
cd terraform
terraform init
```

### 2. Plan the AppSync deployment
```bash
terraform plan
```

### 3. Apply the configuration
```bash
terraform apply
```

### 4. Get the API endpoints and keys
```bash
# Organization Service
terraform output appsync_org_api_url
terraform output -raw appsync_org_api_key

# Member Service
terraform output appsync_member_api_url
terraform output -raw appsync_member_api_key

# ReBac Service
terraform output appsync_rebac_api_url
terraform output -raw appsync_rebac_api_key
```

## Testing the APIs

### Using AWS Console
1. Navigate to AWS AppSync in the AWS Console
2. Select one of the APIs (org-service-api, member-service-api, or rebac-service-api)
3. Go to "Queries" section
4. Use the GraphQL editor to test queries and mutations

### Using GraphQL Client (e.g., curl)

#### Example: List Tenants
```bash
ENDPOINT="<your-org-api-url>"
API_KEY="<your-org-api-key>"

curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "query": "query { listTenants { items { id name } page pageSize totalItems } }"
  }'
```

#### Example: Create a Tenant
```bash
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "query": "mutation CreateTenant($input: TenantInput!) { createTenant(input: $input) { id name } }",
    "variables": {
      "input": {
        "name": "Acme Corporation"
      }
    }
  }'
```

#### Example: List Members
```bash
ENDPOINT="<your-member-api-url>"
API_KEY="<your-member-api-key>"
TENANT_ID="<tenant-id>"

curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
    \"query\": \"query { listMembers(tenantId: \\\"$TENANT_ID\\\") { items { loginId name email } } }\"
  }"
```

#### Example: Create Relations
```bash
ENDPOINT="<your-rebac-api-url>"
API_KEY="<your-rebac-api-key>"

curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "query": "mutation CreateRelations($input: RelationRequest!) { createRelations(input: $input) { message } }",
    "variables": {
      "input": {
        "relations": [
          {
            "resource": "document:123",
            "relationDefinition": "viewer",
            "namespace": "documents",
            "target": "user:alice@example.com"
          }
        ]
      }
    }
  }'
```

## Error Handling

All resolvers include error handling that transforms HTTP errors into GraphQL errors:

- **200/201**: Success - returns data
- **204**: Success - returns true for deletions
- **400**: Bad Request - returns BadRequest error
- **404**: Not Found - returns null for queries
- **500**: Internal Server Error - returns InternalError

Error responses include the error message from the backend service.

## Authentication

Currently, the APIs use API Key authentication for simplicity. To add additional authentication:

1. Update `authentication_type` in the `aws_appsync_graphql_api` resources
2. Add additional authentication providers (IAM, Cognito, OIDC)
3. Configure authorization rules in the resolvers

## Backend Connectivity

All three APIs connect to the backend services through the ALB:
- **ALB Endpoint**: `https://external-private-alb-984336828.us-west-2.elb.amazonaws.com`
- **Connection Type**: HTTP Data Source
- **Protocol**: HTTPS

The ALB routes requests to the appropriate Lambda function based on path patterns:
- `/tenants/*` → Organization Service Lambda
- `/tenants/*/members/*` → Member Service Lambda
- `/relations/*` → ReBac Service Lambda

## Monitoring and Logging

Each AppSync API has:
- CloudWatch Log Group: `/aws/appsync/{service-name}`
- Log Level: ERROR (can be changed to ALL for debugging)
- Retention: 7 days

To view logs:
```bash
# Organization Service
aws logs tail /aws/appsync/org-service --follow

# Member Service
aws logs tail /aws/appsync/member-service --follow

# ReBac Service
aws logs tail /aws/appsync/rebac-service --follow
```

## Future Enhancements

1. **Authentication**: Add Cognito or IAM authentication
2. **Cross-Service Queries**: Add relationships between services (e.g., tenant.members)
3. **Subscriptions**: Add real-time subscriptions for data changes
4. **Caching**: Enable AppSync caching for frequently accessed data
5. **Field-Level Authorization**: Add fine-grained permissions per field
6. **Rate Limiting**: Implement throttling for API protection

## Relationships (Future)

The GraphQL schemas can be enhanced to reflect relationships between services:

```graphql
# Future enhancement: Add members field to Tenant type
type Tenant {
  id: ID!
  name: String!
  members: [Member!]  # Fetched from Member Service
}

# Future enhancement: Add tenant field to Member type
type Member {
  loginId: String!
  name: String
  email: String!
  phone: String
  tenantId: String!
  tenant: Tenant  # Fetched from Org Service
}
```

This would require:
- Pipeline resolvers
- Additional data sources
- Field-level resolvers

## Troubleshooting

### API Key Expiration
API keys are set to expire in 365 days. To rotate:
```bash
terraform apply -replace="aws_appsync_api_key.org"
terraform apply -replace="aws_appsync_api_key.member"
terraform apply -replace="aws_appsync_api_key.rebac"
```

### Backend Connection Issues
If requests fail with connection errors:
1. Verify ALB is accessible from AppSync
2. Check ALB listener rules and target groups
3. Verify Lambda functions are healthy
4. Review CloudWatch logs for both AppSync and Lambda

### Schema Validation Errors
If schema changes cause errors:
1. Validate GraphQL schema syntax
2. Ensure resolver request/response templates match schema
3. Check that HTTP endpoints return expected JSON structure

## Resources

- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [GraphQL Resolver Mapping Template Reference](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference.html)
- [AppSync HTTP Resolvers](https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-http-resolvers.html)
