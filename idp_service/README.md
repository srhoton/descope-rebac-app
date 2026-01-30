# Descope IDP Service

A TypeScript and React-based Single Page Application (SPA) that provides secure authentication via Descope for Fullbay applications.

## Overview

This application provides a simple and secure authentication flow using Descope's hosted authentication pages. Users can sign in, view their profile information, and manage tenant access.

## Features

- **Secure Authentication**: Integration with Descope's hosted authentication pages
- **User Profile Display**: Shows comprehensive user information including email, name, roles, and custom attributes
- **Tenant Management**: Support for multi-tenant authentication (via Descope SDK)
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Type Safety**: Full TypeScript implementation with strict mode enabled
- **Error Handling**: Comprehensive error boundaries and loading states

## Technology Stack

- **React 18**: Functional components with hooks
- **TypeScript**: Strict type checking enabled
- **Vite**: Fast development and optimized production builds
- **Tailwind CSS**: Utility-first styling
- **Descope React SDK**: Authentication integration
- **React Router v6**: Client-side routing
- **Vitest**: Unit testing framework

## Prerequisites

- Node.js 18+ and npm
- Descope project ID (provided via environment variable)

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_DESCOPE_PROJECT_ID=P38a668rJn8AUs65nESCiJqendj6
VITE_APP_URL=http://localhost:3000
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
idp_service/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── LoginButton.tsx
│   │   ├── LogoutButton.tsx
│   │   ├── UserProfile.tsx
│   │   └── TenantSelector.tsx
│   ├── pages/             # Page-level components
│   │   ├── HomePage.tsx
│   │   └── ProfilePage.tsx
│   ├── types/             # TypeScript type definitions
│   │   └── user.types.ts
│   ├── utils/             # Utility functions
│   │   └── descope.utils.ts
│   ├── styles/            # Global styles
│   │   └── index.css
│   ├── test/              # Test setup and utilities
│   │   └── setup.ts
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## Authentication Flow

1. User lands on the homepage
2. User clicks "Sign In with Descope" button
3. User is redirected to Descope's hosted authentication page
4. After successful authentication, user is redirected back to `/profile`
5. User profile information is displayed
6. User can sign out, which clears the session and returns to homepage

## Descope SDK - Tenant Switching Investigation

### SDK Capabilities

The Descope React SDK provides the following hooks and methods relevant to tenant management:

- `useUser()`: Returns the current user object with tenant information
- `useSession()`: Manages session state
- `sdk.logout()`: Clears the current session

### Tenant Switching Implementation

Based on the Descope SDK documentation:

1. **Built-in Support**: The Descope SDK handles tenant information as part of the user object. Tenant data is included in the JWT token and accessible via the `useUser()` hook.

2. **Multi-Tenant Authentication**: To authenticate with a specific tenant:
   - Pass tenant ID during the authentication flow
   - The SDK automatically includes tenant context in the session

3. **Custom Implementation**: The `TenantSelector` component is provided as a placeholder for custom tenant switching logic if needed. The actual implementation depends on:
   - How tenants are assigned to users (via Descope console)
   - Whether tenant switching requires re-authentication
   - Business logic requirements for tenant isolation

### Recommendation

For basic tenant display and management, use the Descope SDK's built-in functionality. The custom `TenantSelector` component should only be used if your use case requires:
- Switching tenants without re-authentication
- Custom UI for tenant selection
- Additional tenant-specific business logic

## Security Considerations

- **Environment Variables**: Never commit `.env` files. Project ID is stored in environment variables.
- **Content Security Policy**: CSP headers configured in `index.html` to restrict script and connection sources.
- **Session Management**: All session management handled by Descope SDK with secure token storage.
- **HTTPS Only**: Application should always be served over HTTPS in production.
- **Input Sanitization**: All user inputs are properly escaped and sanitized.

## Deployment

This application is designed to be deployed to AWS S3 + CloudFront via Terraform:

```bash
# Build the production bundle
npm run build

# The dist/ directory contains the static files ready for deployment
```

The Terraform configuration (in `../terraform/`) handles:
- S3 bucket creation and configuration
- CloudFront distribution setup
- ACM certificate for HTTPS
- Route53 DNS record (descope-idp.sb.fullbay.com)

## Testing

Tests are written using Vitest and React Testing Library:

```bash
# Run tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage
```

Test coverage requirements:
- Minimum 80% overall coverage
- All utility functions tested
- All components have basic tests
- Authentication flows tested

## Code Quality

The project enforces strict code quality standards:

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Configured with React, TypeScript, and security plugins
- **Prettier**: Automated code formatting
- **Security**: eslint-plugin-security for vulnerability detection

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Follow the existing code style and patterns
2. All components must be functional components (no class components)
3. Maintain TypeScript strict mode compliance
4. Write tests for new functionality
5. Update documentation as needed

## License

Proprietary - Fullbay Inc.

## Support

For issues or questions:
- Internal: Contact the DevOps team
- Descope Documentation: https://docs.descope.com/
- Descope React SDK: https://github.com/descope/descope-js/tree/main/packages/sdks/react-sdk
