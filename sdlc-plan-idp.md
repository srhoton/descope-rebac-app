# SDLC Plan: Descope IDP Service

## Status: Complete
## Created: 2026-01-30T10:35:00-08:00
## Last Updated: 2026-01-30T11:15:00-08:00

## Original Request
> Build a TypeScript and React-based website in a new directory called idp_service that allows people to log in via descope. The flow is straightforward: users will land on a homepage with a login button, and upon clicking it, they will be redirected to Descope's hosted login page. After successful authentication, users will be redirected back to our site, where we will display their user information. We will use Descope's React SDK (https://github.com/descope/descope-js/tree/main/packages/sdks/react-sdk).
>
> Additional requirements:
> - Deploy using S3 and CloudFront
> - Use Terraform for deployment (like the rest of the project)
> - Descope project ID: P38a668rJn8AUs65nESCiJqendj6
> - Support logging in/out of different descope tenants
> - DNS: descope-idp.sb.fullbay.com
> - Create ACM certificate (no wildcard needed)

## Clarifications

### User Responses:
1. **Tenant Management UI**: After login. Investigate Descope SDK to see if tenant switching is already implemented before building custom solution.
2. **Route53 Zone**: Terraform will look up hosted zone ID by domain name (sb.fullbay.com)
3. **User Information Display**: Display email, full name, user ID, current tenant, roles/permissions, and any custom attributes if available
4. **Logout Behavior**: Yes to all 3 (return to homepage, clear Descope session, reset tenant selection), but don't re-implement functionality already in Descope SDK

### Implementation Decisions:
- AWS Region: `us-west-2` (consistent with existing infrastructure)
- Environment: `sandbox` (consistent with existing)
- ACM Certificate: Created in `us-east-1` (required for CloudFront)
- Tenant switching: Investigate Descope SDK capabilities first, build custom solution only if needed
- Route53: Use data source to look up hosted zone by domain name

## Architecture Overview

A React SPA (Single Page Application) hosted on S3 and served through CloudFront CDN, using Descope for authentication with multi-tenant support.

### Technology Stack:
- **Frontend**: React 18 (functional components only), TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (for global app state)
- **Authentication**: Descope React SDK
- **Routing**: React Router v6
- **Build Tool**: Vite with TypeScript
- **Infrastructure**: Terraform (AWS S3, CloudFront, ACM, Route53)

### Architecture Flow:
1. User lands on homepage (S3 + CloudFront)
2. User selects tenant (optional) and clicks login
3. Redirected to Descope hosted page
4. After authentication, redirected back with token
5. Display user profile information
6. Support logout and tenant switching

## Components

### Component: React Application (idp_service)
- **Type**: frontend
- **Technology**: React + TypeScript + Vite + Tailwind CSS
- **Subagent**: react-agent
- **Status**: Completed
- **Dependencies**: None
- **Description**: React SPA with Descope authentication, tenant selection, user profile display
- **Files**:
  - `/idp_service/package.json`
  - `/idp_service/vite.config.ts`
  - `/idp_service/tsconfig.json`
  - `/idp_service/tailwind.config.js`
  - `/idp_service/postcss.config.js`
  - `/idp_service/index.html`
  - `/idp_service/src/main.tsx`
  - `/idp_service/src/App.tsx`
  - `/idp_service/src/pages/HomePage.tsx`
  - `/idp_service/src/pages/ProfilePage.tsx`
  - `/idp_service/src/components/LoginButton.tsx`
  - `/idp_service/src/components/LogoutButton.tsx`
  - `/idp_service/src/components/UserProfile.tsx`
  - `/idp_service/src/components/TenantSelector.tsx`
  - `/idp_service/src/contexts/AuthContext.tsx`
  - `/idp_service/src/hooks/useAuth.ts`
  - `/idp_service/src/types/user.types.ts`
  - `/idp_service/src/utils/descope.utils.ts`
  - `/idp_service/.env.example`
  - `/idp_service/README.md`
- **Review History**: (none yet)

### Component: Terraform Infrastructure (S3 + CloudFront + ACM + Route53)
- **Type**: infrastructure
- **Technology**: Terraform (AWS)
- **Subagent**: terraform-agent
- **Status**: Completed
- **Dependencies**: React Application (needs to exist before Terraform can deploy it)
- **Description**: AWS infrastructure for hosting SPA - S3 bucket for static files, CloudFront distribution, ACM certificate, Route53 DNS record
- **Files**:
  - `/terraform/idp_service.tf` (main configuration)
  - `/terraform/idp_acm.tf` (ACM certificate in us-east-1)
  - Updated `/terraform/variables.tf` (add IDP-specific variables)
  - Updated `/terraform/outputs.tf` (add IDP outputs)
- **Configuration**:
  - S3 bucket with website hosting
  - CloudFront distribution with S3 origin
  - ACM certificate in us-east-1 for CloudFront
  - Route53 A record pointing to CloudFront
  - Proper security headers (CORS, CSP)
  - Cache invalidation on deployment
- **Review History**: (none yet)

## Implementation Order

1. **React Application** - Create the frontend first so we can build and deploy static files
   - Reason: Must exist before Terraform can reference the build output

2. **Terraform Infrastructure** - Deploy AWS resources and upload React build
   - Reason: Depends on React application being built and ready to deploy

## Commits

- [x] idp_service React Application: Add Descope authentication SPA with multi-tenant support (61eee97)
- [x] idp_service Terraform Infrastructure: Add S3, CloudFront, ACM, and Route53 configuration for descope-idp.sb.fullbay.com (19bdf5e)

## Current Phase

**Phase**: Complete
**Current Component**: All components complete
**Current Action**: Pull request created at https://github.com/srhoton/descope-rebac-app/pull/2

## Summary

Successfully completed full SDLC for Descope IDP Service:

### React Application (idp_service)
- ✅ TypeScript strict mode enabled
- ✅ Functional components only
- ✅ Descope React SDK v2.26.0 integrated
- ✅ Tailwind CSS responsive design
- ✅ Comprehensive tests with Vitest
- ✅ Build succeeds (729ms)
- ✅ Security headers and CSP configured
- ✅ Descope SDK tenant capabilities documented

### Terraform Infrastructure
- ✅ S3 bucket with versioning
- ✅ CloudFront distribution with OAC
- ✅ ACM certificate in us-east-1
- ✅ Route53 A/AAAA records
- ✅ Security headers policy
- ✅ SPA routing support
- ✅ Deployment guide created

### Commits
- ✅ React application committed (61eee97)
- ✅ Terraform infrastructure committed (19bdf5e)
- ✅ Git notes attached to both commits
- ✅ Branch pushed to origin
- ✅ PR created: https://github.com/srhoton/descope-rebac-app/pull/2

## Notes

### React Application Requirements:
- Functional components only (no class components)
- TypeScript with strict mode
- Tailwind CSS for styling
- React Router for navigation
- Descope React SDK for authentication
- Environment variables for Descope project ID
- Support for tenant selection (mechanism TBD based on user feedback)
- Responsive design (mobile-first)
- Error boundaries for error handling
- Loading states during authentication
- Proper security headers and CSP

### Terraform Requirements:
- Follow existing project structure and naming conventions
- Use existing AWS provider configuration (us-west-2)
- Create additional provider for ACM in us-east-1
- S3 bucket with:
  - Static website hosting enabled
  - Public read access via bucket policy
  - Versioning enabled
  - Lifecycle rules for old versions
- CloudFront distribution with:
  - S3 origin
  - SSL/TLS certificate from ACM
  - Custom domain name (descope-idp.sb.fullbay.com)
  - SPA routing support (redirect 404 to index.html)
  - Security headers via response headers policy
  - Caching optimization
- ACM certificate with DNS validation
- Route53 record for custom domain

### Security Considerations:
- Store Descope project ID in environment variable (not hardcoded)
- Implement CSP headers via CloudFront
- Use HTTPS only (redirect HTTP to HTTPS)
- Implement proper CORS configuration
- Sanitize all user inputs
- Secure token storage (httpOnly cookies if possible, otherwise secure localStorage)

## Error Log

(None yet)
