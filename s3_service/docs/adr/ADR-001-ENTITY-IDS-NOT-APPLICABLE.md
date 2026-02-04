# ADR-001 Non-Applicability: Prefixed Base62 Entity Identifiers

## Status

**Not Applicable** to this repository

## Context

[ADR-001: Prefixed Base62 Entity Identifiers](https://github.com/fullbay/architecture-decisions) specifies that all entity identifiers in Fullbay systems should follow the `{prefix}_{base62id}` format, use SecureRandom for ID generation, and implement DynamoDB conditional writes for uniqueness guarantees.

This repository (`descope-rebac-app`) was evaluated for compliance with ADR-001 during an architecture compliance review.

## Decision

ADR-001 is **intentionally not applicable** to this repository because:

### 1. No Custom Entity Generation

This application is an **API proxy** for the Descope identity platform. All entities (users, tenants, members) are created and managed by Descope's backend services, not by this application.

**Evidence:**
- `member_service/src/main/java/com/fullbay/memberservice/service/MemberService.java` - Creates members via Descope SDK
- `org_service/src/main/java/com/fullbay/orgservice/service/OrgService.java` - Manages tenants via Descope SDK
- No DynamoDB tables are defined in the Terraform configuration

### 2. Entity IDs Come from Descope

All entity identifiers used in this system originate from Descope:

| Entity Type | Source | Example Format |
|-------------|--------|----------------|
| User ID | Descope `userId` | `U2abc123...` |
| Tenant ID | Descope `tenantId` | `T2xyz789...` |
| Login ID | Descope `loginId` | Email or phone number |

The application receives these IDs through:
- JWT token claims (`sub`, `tenantIds`, `dct`)
- Descope SDK responses
- GraphQL API responses

### 3. No Data Persistence Layer

This application is stateless and does not persist any data:
- No DynamoDB tables
- No RDS databases
- No custom data stores

All data persistence is handled by:
- Descope (identity, users, tenants)
- AWS S3 (image storage, managed by S3 presigned URLs)

## Consequences

### Positive

- Simplified architecture with single source of truth for identities (Descope)
- No need to implement ID generation logic
- No risk of ID collision or uniqueness violations in this codebase

### Negative

- Entity IDs may not follow Fullbay's preferred format (dependent on Descope's format)
- Cannot control ID structure for debugging or operational purposes

### Mitigation

If Fullbay ID format compliance becomes required in the future, the following approaches could be considered:

1. **ID Mapping Layer**: Create a mapping service that associates Fullbay-formatted IDs with Descope IDs
2. **Custom Claims**: Work with Descope to add custom claims with Fullbay-formatted IDs
3. **Separate Entity Store**: Introduce a DynamoDB table to store Fullbay-formatted references to Descope entities

## Related Documents

- [ADR-001: Prefixed Base62 Entity Identifiers](https://github.com/fullbay/architecture-decisions/blob/main/ADR-001-entity-identifiers.md)
- [Descope User Management Documentation](https://docs.descope.com/manage/users/)

## Review History

| Date | Reviewer | Outcome | Notes |
|------|----------|---------|-------|
| 2026-02-04 | ADR Compliance Reviewer | Confirmed Not Applicable | Initial review during feat/idp-service implementation |
