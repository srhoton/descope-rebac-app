# Organization Service

A Quarkus-based AWS Lambda service for managing Descope tenants.

## Overview

This service provides REST API endpoints for CRUD operations on Descope tenants. It runs as an AWS Lambda function deployed in a private VPC subnet and is accessible through an Application Load Balancer.

## Features

- Create, Read, Update, and Delete Descope tenants
- Paginated tenant listing
- JSON structured logging
- AWS Lambda optimized with SnapStart support
- Secure credential management via AWS Secrets Manager

## API Endpoints

### Create Tenant
```
POST /tenants
Content-Type: application/json

{
  "name": "My Tenant"
}

Response: 201 Created
{
  "id": "tenant-123",
  "name": "My Tenant"
}
```

### Get Tenant
```
GET /tenants/{tenantId}

Response: 200 OK
{
  "id": "tenant-123",
  "name": "My Tenant"
}
```

### List Tenants (Paginated)
```
GET /tenants?page=0&pageSize=20

Response: 200 OK
{
  "items": [
    {
      "id": "tenant-123",
      "name": "My Tenant"
    }
  ],
  "page": 0,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1
}
```

### Update Tenant
```
PUT /tenants/{tenantId}
Content-Type: application/json

{
  "name": "Updated Tenant Name"
}

Response: 200 OK
{
  "id": "tenant-123",
  "name": "Updated Tenant Name"
}
```

### Delete Tenant
```
DELETE /tenants/{tenantId}

Response: 204 No Content
```

## Technology Stack

- Java 21
- Quarkus 3.16.3
- Descope Java SDK
- Gradle
- AWS Lambda
- AWS Secrets Manager

## Building

### Prerequisites
- Java 21
- Gradle (wrapper included)

### Build the application
```bash
./gradlew build
```

### Run tests
```bash
./gradlew test
```

### Format code
```bash
./gradlew spotlessApply
```

### Package for Lambda
```bash
./gradlew build -Dquarkus.package.type=uber-jar
```

The Lambda deployment package will be created at:
```
build/function.zip
```

## Configuration

The service requires the following environment variables:

- `DESCOPE_PROJECT_ID` - Descope project identifier
- `DESCOPE_MANAGEMENT_KEY` - Descope management API key

These are automatically injected from AWS Secrets Manager during deployment.

## Local Development

For local testing, set the environment variables:

```bash
export DESCOPE_PROJECT_ID=your-project-id
export DESCOPE_MANAGEMENT_KEY=your-management-key

./gradlew quarkusDev
```

## Deployment

The service is deployed using Terraform. See the `terraform/` directory for infrastructure configuration.

## Testing

The service includes comprehensive unit and integration tests:

- `TenantServiceTest` - Service layer tests
- `TenantResourceTest` - REST API endpoint tests

Run tests with coverage:
```bash
./gradlew test jacocoTestReport
```

## Logging

The service uses JSON structured logging for CloudWatch integration. Log retention is set to 7 days.

## License

Copyright © 2026 Fullbay
