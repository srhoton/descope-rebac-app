# SDLC Plan: Consolidate IDP Service Authentication into S3 Service

## Status: Complete
## Created: 2026-01-31T10:30:00Z
## Last Updated: 2026-01-31T18:30:00Z

## Original Request
> The user wants to copy the idp_service functionality *into* the s3_service. Meaning, if a user isn't logged in, instead of being redirected to the idp_service, the functionality the idp_service provides happens inside the s3_service.
>
> Current context:
> - There is an existing `idp_service` at `/Users/steverhoton/git/descope-rebac-app/idp_service/` that handles Descope authentication with magic link support
> - There is an existing `s3_service` at `/Users/steverhoton/git/descope-rebac-app/s3_service/` that is a React app for image upload/sharing
> - The s3_service currently redirects unauthenticated users to the idp_service
> - Both services use Descope for authentication
> - The user wants to consolidate so the s3_service handles its own authentication flow
>
> The current branch is `feat/idp-service`.

## Clarifications
- **Q1**: Should we keep the idp_service after consolidation, or will it be deprecated?
  - **A**: The IDP Service will be **deprecated** after consolidation

- **Q2**: Should the s3_service still support the returnUrl redirect pattern for future use cases, or should it become purely standalone?
  - **A**: **No** return URL support needed - s3_service will be purely standalone

- **Q3**: Should the magic link/OTP authentication flow be embedded directly in the s3_service, or should it be shown as a modal/overlay?
  - **A**: Use a **dedicated login page** with Descope's captive portal (redirect to Descope hosted auth)

- **Q4**: Should we maintain the same styling/branding from the idp_service, or adapt to s3_service styling?
  - **A**: **Rebrand** to match s3_service styling as "Image Service Login"

## Architecture Overview

The consolidation will transform the s3_service from a dependent service that redirects to idp_service for authentication into a standalone service that handles its own authentication flow using the Descope React SDK.

**Current Architecture:**
- s3_service: Protected routes redirect to idp_service for login
- idp_service: Handles login, then redirects back to s3_service with session cookies
- Session sharing via cookies across subdomains (auth.sb.fullbay.com)

**Target Architecture:**
- s3_service: Self-contained with dedicated login page using Descope flow component
- Login page at `/login` route uses Descope's captive portal (redirects to Descope hosted auth)
- No external redirects to idp_service
- No returnUrl redirect pattern support (standalone service)
- idp_service: Will be deprecated after consolidation
- Branding: "Image Service Login" matching s3_service styling

## Components

### Component: Consolidated IDP Service into S3 Service
- **Type**: frontend
- **Technology**: React/TypeScript/Vite
- **Subagent**: Direct implementation
- **Status**: Completed
- **Dependencies**: None
- **Description**: Consolidated all IDP service functionality into s3_service. Created standalone login page, updated routing, removed token initialization logic, updated hooks, and cleaned up environment configuration.
- **Files**:
  - NEW: `/Users/steverhoton/git/descope-rebac-app/s3_service/src/pages/LoginPage.tsx` - Dedicated login page with Descope flow, rebranded as "Image Service Login"
  - MODIFIED: `/Users/steverhoton/git/descope-rebac-app/s3_service/src/components/ProtectedRoute.tsx` - Redirects to /login instead of external IDP
  - MODIFIED: `/Users/steverhoton/git/descope-rebac-app/s3_service/src/App.tsx` - Added /login route
  - DELETED: `/Users/steverhoton/git/descope-rebac-app/s3_service/src/initTokens.ts` - Removed token initialization
  - DELETED: `/Users/steverhoton/git/descope-rebac-app/s3_service/src/contexts/TokenContext.tsx` - Removed token context
  - MODIFIED: `/Users/steverhoton/git/descope-rebac-app/s3_service/src/main.tsx` - Removed initTokens import
  - MODIFIED: `/Users/steverhoton/git/descope-rebac-app/s3_service/src/hooks/useDescope.ts` - Updated logout to use Descope SDK
  - MODIFIED: `/Users/steverhoton/git/descope-rebac-app/s3_service/.env.example` - Removed VITE_IDP_DOMAIN
  - MODIFIED: `/Users/steverhoton/git/descope-rebac-app/s3_service/README.md` - Updated documentation
- **Review History**:
  - 2026-01-31T18:30:00Z - Implementation completed, TypeScript compilation successful, build successful

## Implementation Order
1. **Authentication UI Integration** - Copy and adapt authentication components from idp_service (no dependencies on other changes)
2. **Protected Route Refactor** - Update routing to use local login instead of redirecting (depends on authentication UI)
3. **Custom Hook Updates** - Remove IDP redirect logic from useDescope hook (depends on protected route changes)
4. **Token Initialization Cleanup** - Remove URL token extraction since we're not receiving redirects (depends on route changes)
5. **Environment Configuration Update** - Clean up environment variables and documentation (final cleanup step)

## Commits
- [ ] Consolidate IDP service into s3_service: Add standalone authentication, remove external dependencies

## Current Phase
**Phase**: 4-Commit
**Current Component**: Consolidated IDP Service into S3 Service
**Current Action**: Creating commit with all changes

## Error Log
None
