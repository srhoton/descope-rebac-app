# Member Service

A Quarkus-based Java 21 Lambda service for managing Descope members within tenants.

## Overview

This service provides CRUD operations for managing members in Descope tenants through a REST API. It is deployed as an AWS Lambda function behind an Application Load Balancer (ALB).

## Features

- Create members in a tenant
- Retrieve member details by login ID
- Update member information
- Delete members from a tenant
- List all members in a tenant with pagination
- JSON-formatted logging
- Comprehensive error handling
- Unit and integration tests with 80%+ coverage

## Technology Stack

- Java 21
- Quarkus 3.x
- Descope Java SDK 1.0.60
- AWS Lambda (with SnapStart)
- Gradle 8.x
- JUnit 5 / AssertJ / Mockito

## API Endpoints

All endpoints are prefixed with `/tenants/{tenantId}/members`

### Create Member
```
POST /tenants/{tenantId}/members
Content-Type: application/json

{
  "loginId": "user@example.com",
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890"
}

Response: 201 Created
```

### Get Member
```
GET /tenants/{tenantId}/members/{loginId}

Response: 200 OK
{
  "loginId": "user@example.com",
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "tenantId": "tenant123"
}
```

### List Members
```
GET /tenants/{tenantId}/members?page=0&pageSize=20

Response: 200 OK
{
  "items": [...],
  "page": 0,
  "pageSize": 20,
  "totalItems": 100,
  "totalPages": 5
}
```

### Update Member
```
PUT /tenants/{tenantId}/members/{loginId}
Content-Type: application/json

{
  "loginId": "user@example.com",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+0987654321"
}

Response: 200 OK
```

### Delete Member
```
DELETE /tenants/{tenantId}/members/{loginId}

Response: 204 No Content
```

## Building

### Build the Lambda artifact
```bash
./gradlew clean build
```

The Lambda deployment artifact will be available at `build/function.zip`.

### Run tests
```bash
./gradlew test
```

### Format code
```bash
./gradlew spotlessApply
```

### Check code formatting
```bash
./gradlew spotlessCheck
```

## Configuration

The service requires the following environment variables (automatically injected by Lambda):

- `DESCOPE_PROJECT_ID` - Descope project ID
- `DESCOPE_MANAGEMENT_KEY` - Descope management API key

These are retrieved from AWS Secrets Manager (`sandbox/descope/rebac`).

## Deployment

The service is deployed using Terraform. See the `terraform/` directory in the root of this repository.

```bash
cd ../terraform
terraform init
terraform plan
terraform apply
```

## Development

### Local testing with Quarkus Dev Mode
```bash
./gradlew quarkusDev
```

This starts the service locally on port 8080 with live reload.

### Run specific tests
```bash
./gradlew test --tests MemberResourceTest
./gradlew test --tests MemberServiceTest
```

## Architecture

```
MemberResource (REST API)
    ↓
MemberService (Business Logic)
    ↓
DescopeClient (Descope SDK)
    ↓
Descope API
```

## Error Handling

All errors are returned in a consistent format:

```json
{
  "error": "Error title",
  "message": "Detailed error message"
}
```

HTTP Status Codes:
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `404 Not Found` - Member not found
- `500 Internal Server Error` - Server-side error

## Logging

The service uses structured JSON logging for CloudWatch integration. All operations are logged with appropriate context.

## Testing

The service includes comprehensive unit and integration tests:

- `MemberServiceTest` - Service layer tests with mocked Descope client
- `MemberResourceTest` - REST endpoint tests with mocked service layer

Run tests with coverage:
```bash
./gradlew test jacocoTestReport
```

Coverage report available at: `build/reports/jacoco/test/html/index.html`
