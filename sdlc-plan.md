# SDLC Plan: Add OpenAPI Specifications to Java Services

## Status: Complete
## Created: 2026-01-29T10:00:00Z
## Last Updated: 2026-01-29T19:30:00Z

## Original Request
> For each of the 3 Java repos (org_service, member_service, rebac_service), please instrument the creation of OpenAPI specs for these services, and put the OpenAPI spec in the openapi folder of each service.
>
> IMPORTANT CONTEXT:
> - These are Quarkus-based Java 21 Lambda services
> - Each service already has REST endpoints defined with JAX-RS annotations
> - The services are located at:
>   - /Users/steverhoton/git/descope-rebac-app/org_service/
>   - /Users/steverhoton/git/descope-rebac-app/member_service/
>   - /Users/steverhoton/git/descope-rebac-app/rebac_service/
> - Use Quarkus SmallRye OpenAPI extension to generate specs
> - Put the generated/static OpenAPI specs in an `openapi/` folder within each service

## Clarifications
None required - requirements are clear.

## Architecture Overview
This task involves instrumenting OpenAPI specification generation for three existing Quarkus-based Java 21 Lambda services. Each service has JAX-RS REST endpoints that will be annotated with OpenAPI metadata using the Quarkus SmallRye OpenAPI extension. The OpenAPI specifications will be generated and stored in an `openapi/` folder within each service directory.

## Components

### Component: org_service OpenAPI
- **Type**: backend
- **Technology**: Java 21 / Quarkus
- **Subagent**: java-quarkus-agent
- **Status**: Approved
- **Dependencies**: []
- **Description**: Add SmallRye OpenAPI extension to org_service, annotate TenantResource endpoints with OpenAPI metadata, configure OpenAPI generation, and create openapi/ folder with generated spec
- **Files**:
  - /Users/steverhoton/git/descope-rebac-app/org_service/build.gradle (add dependency)
  - /Users/steverhoton/git/descope-rebac-app/org_service/src/main/resources/application.properties (configure OpenAPI)
  - /Users/steverhoton/git/descope-rebac-app/org_service/src/main/java/com/fullbay/orgservice/TenantResource.java (add annotations)
  - /Users/steverhoton/git/descope-rebac-app/org_service/src/main/java/com/fullbay/orgservice/model/Tenant.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/org_service/src/main/java/com/fullbay/orgservice/model/TenantRequest.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/org_service/src/main/java/com/fullbay/orgservice/model/PaginatedResponse.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/org_service/openapi/openapi.yaml (generated spec)
- **Review History**:

### Component: member_service OpenAPI
- **Type**: backend
- **Technology**: Java 21 / Quarkus
- **Subagent**: java-quarkus-agent
- **Status**: Approved
- **Dependencies**: []
- **Description**: Add SmallRye OpenAPI extension to member_service, annotate MemberResource endpoints with OpenAPI metadata, configure OpenAPI generation, and create openapi/ folder with generated spec
- **Files**:
  - /Users/steverhoton/git/descope-rebac-app/member_service/build.gradle (add dependency)
  - /Users/steverhoton/git/descope-rebac-app/member_service/src/main/resources/application.properties (configure OpenAPI)
  - /Users/steverhoton/git/descope-rebac-app/member_service/src/main/java/com/fullbay/memberservice/MemberResource.java (add annotations)
  - /Users/steverhoton/git/descope-rebac-app/member_service/src/main/java/com/fullbay/memberservice/model/Member.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/member_service/src/main/java/com/fullbay/memberservice/model/MemberRequest.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/member_service/src/main/java/com/fullbay/memberservice/model/PaginatedResponse.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/member_service/openapi/openapi.yaml (generated spec)
- **Review History**:

### Component: rebac_service OpenAPI
- **Type**: backend
- **Technology**: Java 21 / Quarkus
- **Subagent**: java-quarkus-agent
- **Status**: Approved
- **Dependencies**: []
- **Description**: Add SmallRye OpenAPI extension to rebac_service, annotate RelationResource endpoints with OpenAPI metadata, configure OpenAPI generation, and create openapi/ folder with generated spec
- **Files**:
  - /Users/steverhoton/git/descope-rebac-app/rebac_service/build.gradle (add dependency)
  - /Users/steverhoton/git/descope-rebac-app/rebac_service/src/main/resources/application.properties (configure OpenAPI)
  - /Users/steverhoton/git/descope-rebac-app/rebac_service/src/main/java/com/fullbay/rebacservice/RelationResource.java (add annotations)
  - /Users/steverhoton/git/descope-rebac-app/rebac_service/src/main/java/com/fullbay/rebacservice/model/RelationTuple.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/rebac_service/src/main/java/com/fullbay/rebacservice/model/RelationRequest.java (add schema annotations)
  - /Users/steverhoton/git/descope-rebac-app/rebac_service/openapi/openapi.yaml (generated spec)
- **Review History**:

## Implementation Order
1. org_service OpenAPI - Independent service, no dependencies
2. member_service OpenAPI - Independent service, no dependencies
3. rebac_service OpenAPI - Independent service, no dependencies

Note: All three services are independent and can be implemented in parallel, but will be done sequentially for clarity and to ensure consistency across all implementations.

## Commits
- [x] org_service: Add OpenAPI specification with SmallRye OpenAPI extension (commit: fb819e6)
- [x] member_service: Add OpenAPI specification with SmallRye OpenAPI extension (commit: 82953ed)
- [x] rebac_service: Add OpenAPI specification with SmallRye OpenAPI extension (commit: 281c7f6)

## Current Phase
**Phase**: 4-Commit
**Current Component**: All components complete
**Current Action**: All OpenAPI specifications successfully implemented and committed

## Error Log
No errors encountered.
