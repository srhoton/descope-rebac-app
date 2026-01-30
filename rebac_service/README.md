# ReBAC Service

A Quarkus-based AWS Lambda service for managing Descope Fine-Grained Authorization (FGA) relation tuples.

## Overview

This service provides REST API endpoints for creating, deleting, and querying ReBAC relation tuples using the Descope SDK. It enables management of authorization relationships between targets (users, groups) and resources.

## Features

- **Create Relations**: Add authorization relationships between targets and resources
- **Delete Relations**: Remove authorization relationships
- **Query Who Can Access**: Find all targets that can access a resource with a specific relation
- **Query Resource Relations**: Get all relations for a specific resource
- **Query Target Access**: Find all resources a target can access

## Technology Stack

- Java 21
- Quarkus 3.16.3
- AWS Lambda
- Descope Java SDK 1.0.60
- Gradle
- JUnit 5 + AssertJ for testing

## API Endpoints

### Create Relations
```
POST /relations
Content-Type: application/json

{
  "relations": [
    {
      "resource": "document:123",
      "relationDefinition": "owner",
      "namespace": "documents",
      "target": "user:alice@example.com"
    }
  ]
}
```

### Delete Relations
```
DELETE /relations
Content-Type: application/json

{
  "relations": [
    {
      "resource": "document:123",
      "relationDefinition": "owner",
      "namespace": "documents",
      "target": "user:alice@example.com"
    }
  ]
}
```

### Query Who Can Access
```
GET /relations/who-can-access?resource=document:123&relationDefinition=viewer&namespace=documents

Response:
{
  "targets": ["user:alice@example.com", "user:bob@example.com"]
}
```

### Get Resource Relations
```
GET /relations/resource/{resourceId}

Response:
{
  "relations": [
    {
      "resource": "document:123",
      "relationDefinition": "owner",
      "namespace": "documents",
      "target": "user:alice@example.com"
    }
  ]
}
```

### Get Target Access
```
GET /relations/target/{targetId}

Response:
{
  "relations": [
    {
      "resource": "document:123",
      "relationDefinition": "owner",
      "namespace": "documents",
      "target": "user:alice@example.com"
    }
  ]
}
```

## Configuration

The service requires the following environment variables:

- `DESCOPE_PROJECT_ID`: Your Descope project ID
- `DESCOPE_MANAGEMENT_KEY`: Your Descope management key

These are automatically injected from AWS Secrets Manager when deployed.

## Building

Build the project and create the Lambda deployment package:

```bash
./gradlew clean build
```

This creates `build/function.zip` ready for Lambda deployment.

## Testing

Run all tests:

```bash
./gradlew test
```

Run tests with coverage:

```bash
./gradlew test jacocoTestReport
```

## Code Quality

Format code with Spotless:

```bash
./gradlew spotlessApply
```

Check code formatting:

```bash
./gradlew spotlessCheck
```

## Deployment

The service is deployed to AWS Lambda via Terraform. See the `terraform/rebac_service.tf` configuration.

The Lambda function is:
- Deployed in a VPC with private subnets
- Integrated with an Application Load Balancer (ALB)
- Configured with SnapStart for improved cold start performance
- Uses JSON logging with 7-day CloudWatch retention

## Health Check

The service includes a Quarkus health check endpoint:

```
GET /q/health
```

This is used by the ALB for health monitoring.

## Development

### Local Development

Set environment variables:

```bash
export DESCOPE_PROJECT_ID=your-project-id
export DESCOPE_MANAGEMENT_KEY=your-management-key
```

Run in dev mode:

```bash
./gradlew quarkusDev
```

### Project Structure

```
rebac_service/
├── src/
│   ├── main/
│   │   ├── java/com/fullbay/rebacservice/
│   │   │   ├── RelationResource.java       # REST endpoints
│   │   │   ├── config/
│   │   │   │   └── DescopeConfig.java      # Descope client config
│   │   │   ├── model/
│   │   │   │   ├── RelationTuple.java      # Relation data model
│   │   │   │   ├── RelationRequest.java    # Request DTOs
│   │   │   │   └── WhoCanAccessRequest.java
│   │   │   └── service/
│   │   │       └── RelationService.java    # Business logic
│   │   └── resources/
│   │       └── application.properties      # Configuration
│   └── test/
│       └── java/com/fullbay/rebacservice/
│           ├── RelationResourceTest.java   # REST tests
│           └── service/
│               └── RelationServiceTest.java # Service tests
├── build.gradle                            # Build configuration
└── README.md                               # This file
```

## License

Proprietary - Fullbay Inc.
