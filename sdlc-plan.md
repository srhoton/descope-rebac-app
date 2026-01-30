# SDLC Plan: Member Service for Descope ReBac Application

## Status: In Progress
## Created: 2026-01-29
## Last Updated: 2026-01-29

## Original Request
> In a new directory called 'member_service', we need to create a new Quarkus based Java21 lambda service that will do CRUD operations against descope members in a tenant in a project. It should:
> - be deployed in an existing VPC (default value should be 'vpc-03163f35ccd0fc6a9')
> - in private subnets (which can be determined from the tag 'tier' with value 'private')
> - behind an existing alb (default arn should be arn:aws:elasticloadbalancing:us-west-2:345594586248:loadbalager/app/external-private-alb/720e2b5474d3d602)
> - Use terraform (in a new directory called terraform at the root) to fully build and deploy. Local state is fine.
> - It should use the Descope Java SDK (https://github.com/descope/descope-java) for all operations.
> - The project id and management key should be provided via secrets manager and injected as environment variables into the lambda. They default secret name is 'sandbox/descope/rebac', which has two keys: 'projectId' and 'managementKey'.
> - Be REST compliant and have endpoints for Create, Read, Update, and Delete operations on members in a tenant.
> - The tenant id should be provided as a path parameter.
> - Include proper error handling and logging.
> - Deployed to the us-west-2 region.
>
> **IMPORTANT CONTEXT**: There is an existing `org_service` in this repo that was previously built for tenant CRUD operations. The terraform infrastructure already exists in `terraform/` directory.

## Clarifications
- **Terraform Structure**: The existing terraform in `/terraform` directory already handles Lambda deployment for org_service. We will extend this infrastructure to support member_service by adding a second Lambda function and ALB listener rule.
- **Member Operations Scope**: Based on Descope SDK documentation, member operations will include: create member in tenant, get member by login ID, update member, delete member, and list members in a tenant (with pagination).
- **API Path Pattern**: Members will be accessed via path: `/tenants/{tenantId}/members` and `/tenants/{tenantId}/members/{loginId}` to indicate the hierarchical relationship.
- **Build Process**: Following org_service pattern, member_service will use Gradle with Quarkus, Spotless for formatting, and JUnit 5 for testing.
- **Lambda Config**: 1024MB memory, 60s timeout, SnapStart enabled (same as org_service)
- **Logging**: JSON format, 7 days CloudWatch retention (same as org_service)

## Architecture Overview

The member_service is a Java 21-based Quarkus Lambda microservice that provides CRUD operations for Descope members within tenants. It follows the same architecture as the existing org_service:

- **Backend Service**: Java 21 Quarkus Lambda function
- **API Gateway**: AWS Application Load Balancer (ALB) with path-based routing
- **Infrastructure**: AWS Lambda in VPC with private subnets
- **State Management**: Terraform local state (can be migrated to remote later)
- **Security**: Secrets Manager for credentials, VPC security groups for network isolation

## Components

### Component: Member Service - Java Application
- **Type**: backend
- **Technology**: Java 21 / Quarkus / Gradle
- **Subagent**: java-quarkus-agent
- **Status**: Implementation Complete (Tests Need Updates)
- **Dependencies**: None (standalone service)
- **Description**: Quarkus-based Lambda service providing REST API for member CRUD operations in Descope tenants
- **Files**:
  - `member_service/build.gradle` - Gradle build configuration
  - `member_service/gradle.properties` - Gradle properties
  - `member_service/settings.gradle` - Gradle settings
  - `member_service/gradlew` - Gradle wrapper script
  - `member_service/.gitignore` - Git ignore patterns
  - `member_service/src/main/java/com/fullbay/memberservice/MemberResource.java` - REST API endpoints
  - `member_service/src/main/java/com/fullbay/memberservice/service/MemberService.java` - Business logic for member operations
  - `member_service/src/main/java/com/fullbay/memberservice/config/DescopeConfig.java` - Descope client configuration
  - `member_service/src/main/java/com/fullbay/memberservice/model/Member.java` - Member data model
  - `member_service/src/main/java/com/fullbay/memberservice/model/MemberRequest.java` - Member request DTO
  - `member_service/src/main/java/com/fullbay/memberservice/model/PaginatedResponse.java` - Paginated response wrapper
  - `member_service/src/main/resources/application.properties` - Application configuration
  - `member_service/src/test/java/com/fullbay/memberservice/MemberResourceTest.java` - REST endpoint tests
  - `member_service/src/test/java/com/fullbay/memberservice/service/MemberServiceTest.java` - Service layer tests
  - `member_service/src/test/resources/application.properties` - Test configuration
  - `member_service/README.md` - Service documentation
- **Review History**: None yet

### Component: Terraform Infrastructure Extension
- **Type**: infrastructure
- **Technology**: Terraform / AWS
- **Subagent**: terraform-agent
- **Status**: Pending
- **Dependencies**: Member Service - Java Application (needs function.zip to exist)
- **Description**: Extend existing Terraform infrastructure to deploy member_service Lambda with ALB integration
- **Files**:
  - `terraform/lambda.tf` - Add member_service Lambda function resource alongside org_service
  - `terraform/alb.tf` - Add member_service target group and listener rule with priority 240
  - `terraform/cloudwatch.tf` - Add CloudWatch log group for member_service
  - `terraform/outputs.tf` - Add member_service Lambda ARN and endpoint outputs
- **Review History**: None yet

## Implementation Order

1. **Member Service - Java Application**
   - Reason: Must be built first to generate function.zip that Terraform references
   - The Gradle build will produce the Lambda deployment artifact at `member_service/build/function.zip`

2. **Terraform Infrastructure Extension**
   - Reason: Depends on the function.zip artifact from the Java application build
   - Will extend existing infrastructure to support second Lambda service

## Commits

- [ ] Member Service: Add Quarkus-based member management Lambda service with Descope SDK integration
- [ ] Infrastructure: Extend Terraform to deploy member_service Lambda with ALB routing

## Current Phase
**Phase**: 2-Implementation
**Current Component**: Member Service - Java Application
**Current Action**: Dispatching to java-quarkus-agent for implementation

## Error Log
None yet.
