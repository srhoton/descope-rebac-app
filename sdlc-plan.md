# SDLC Plan: Descope Tenant Management Service

## Status: In Progress
## Created: 2026-01-29T10:00:00Z
## Last Updated: 2026-01-29T10:05:00Z

## Original Request
> In a new directory called 'org_service', we need to create a new Quarkus based Java21 lambda service that will do CRUD operations against descope tenants in a project. It should:
> - be deployed in an existing VPC (default value should be 'vpc-03163f35ccd0fc6a9')
> - in private subnets (which can be determined from the tag 'tier' with value 'private')
> - behind an existing alb (default arn should be arn:aws:elasticloadbalancing:us-west-2:345594586248:loadbalancer/app/external-private-alb/720e2b5474d3d602)
> - Use terraform (in a new directory called terraform at the root) to fully build and deploy. Local state is fine.
> - It should use the Descope Java SDK (https://github.com/descope/descope-java) for all operations.
> - The project id and management key should be provided via secrets manager and injected as environment variables into the lambda. They default secret name is 'sandbox/descope/rebac', which has two keys: 'projectId' and 'managementKey'.
> - Be REST compliant and have endpoints for Create, Read, Update, and Delete operations on tenants.

## Clarifications
- **API Gateway**: None - direct ALB integration
- **Authentication**: None - handled by upstream layers
- **Tenant Operations**: Name and ID only, with pagination support
- **Lambda Config**: 1024MB memory, 60s timeout, SnapStart enabled
- **Testing**: Include integration tests
- **Logging**: JSON format, 7 days CloudWatch retention
- **Networking**: VPC has internet access via NAT Gateway
- **Monitoring**: No CloudWatch alarms or X-Ray at this time

## Architecture Overview

This service creates a Quarkus-based Java 21 Lambda function for managing Descope tenants. The Lambda is deployed in a private subnet within an existing VPC, accessible through an existing Application Load Balancer. It uses the Descope Java SDK to perform CRUD operations on tenants, with credentials securely stored in AWS Secrets Manager.

### Key Components:
1. **Java/Quarkus Lambda Service** - REST API for tenant management
2. **Terraform Infrastructure** - AWS resources (Lambda, IAM, ALB integration, CloudWatch)
3. **Descope SDK Integration** - Tenant management operations
4. **Secrets Manager Integration** - Secure credential handling

## Components

### Component: Java Quarkus Lambda Service
- **Type**: backend
- **Technology**: Java 21 / Quarkus / Gradle
- **Subagent**: java-quarkus-agent
- **Status**: In Progress
- **Dependencies**: []
- **Description**: Quarkus-based Lambda function providing REST endpoints for Descope tenant CRUD operations
- **Files**:
  - `org_service/build.gradle`
  - `org_service/settings.gradle`
  - `org_service/gradle.properties`
  - `org_service/src/main/java/com/fullbay/orgservice/TenantResource.java`
  - `org_service/src/main/java/com/fullbay/orgservice/service/TenantService.java`
  - `org_service/src/main/java/com/fullbay/orgservice/model/Tenant.java`
  - `org_service/src/main/java/com/fullbay/orgservice/model/TenantRequest.java`
  - `org_service/src/main/java/com/fullbay/orgservice/model/PaginatedResponse.java`
  - `org_service/src/main/java/com/fullbay/orgservice/config/DescopeConfig.java`
  - `org_service/src/main/resources/application.properties`
  - `org_service/src/test/java/com/fullbay/orgservice/TenantResourceTest.java`
  - `org_service/src/test/java/com/fullbay/orgservice/service/TenantServiceTest.java`
  - `org_service/README.md`
- **Review History**: []

### Component: Terraform Infrastructure
- **Type**: infrastructure
- **Technology**: Terraform / AWS
- **Subagent**: terraform-agent
- **Status**: Pending
- **Dependencies**: [Java Quarkus Lambda Service]
- **Description**: Terraform configuration to deploy Lambda function, configure ALB integration, IAM roles, Secrets Manager access, and CloudWatch logging
- **Files**:
  - `terraform/main.tf`
  - `terraform/variables.tf`
  - `terraform/outputs.tf`
  - `terraform/versions.tf`
  - `terraform/lambda.tf`
  - `terraform/iam.tf`
  - `terraform/alb.tf`
  - `terraform/cloudwatch.tf`
  - `terraform/data.tf`
  - `terraform/README.md`
- **Review History**: []

## Implementation Order
1. **Java Quarkus Lambda Service** - Must be built first to create deployable artifact
2. **Terraform Infrastructure** - Depends on Lambda artifact being available for deployment

## Commits
- [ ] Java Quarkus Lambda Service: Add Quarkus-based tenant management Lambda service with Descope SDK integration
- [ ] Terraform Infrastructure: Add Terraform configuration for Lambda deployment with ALB and Secrets Manager integration

## Current Phase
**Phase**: 2-Implementation
**Current Component**: Java Quarkus Lambda Service
**Current Action**: Dispatching to java-quarkus-agent for implementation

## Error Log
[No errors at this time]
