/**
 * Tests for StandaloneImagePage component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StandaloneImagePage } from '../StandaloneImagePage';

// Mock the Descope SDK
vi.mock('@descope/react-sdk', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useSession: () => ({
    sessionToken: 'mock-session-token',
    isAuthenticated: true,
    isSessionLoading: false,
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="browser-router">{children}</div>
  ),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="memory-router">{children}</div>
  ),
}));

// Mock TenantProvider
vi.mock('../../contexts/TenantContext', () => ({
  TenantProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tenant-provider">{children}</div>
  ),
}));

// Mock ImageUploadPage to track props
vi.mock('../../pages/ImageUploadPage', () => ({
  ImageUploadPage: ({ hideChrome }: { hideChrome?: boolean }) => (
    <div data-testid="image-upload-page" data-hide-chrome={hideChrome?.toString()}>
      ImageUploadPage
    </div>
  ),
}));

// Mock authTokenProvider
vi.mock('../../services/authTokenProvider', () => ({
  setTokenGetter: vi.fn(),
}));

describe('StandaloneImagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear environment variable mock
    vi.stubEnv('VITE_DESCOPE_PROJECT_ID', '');
  });

  describe('router type handling', () => {
    it('should use MemoryRouter by default', () => {
      render(<StandaloneImagePage />);

      expect(screen.getByTestId('memory-router')).toBeInTheDocument();
      expect(screen.queryByTestId('browser-router')).not.toBeInTheDocument();
    });

    it('should use BrowserRouter when routerType is "browser"', () => {
      render(<StandaloneImagePage routerType="browser" />);

      expect(screen.getByTestId('browser-router')).toBeInTheDocument();
      expect(screen.queryByTestId('memory-router')).not.toBeInTheDocument();
    });

    it('should use MemoryRouter when routerType is "memory"', () => {
      render(<StandaloneImagePage routerType="memory" />);

      expect(screen.getByTestId('memory-router')).toBeInTheDocument();
    });

    it('should not wrap with router when routerType is "none"', () => {
      render(<StandaloneImagePage routerType="none" />);

      expect(screen.queryByTestId('memory-router')).not.toBeInTheDocument();
      expect(screen.queryByTestId('browser-router')).not.toBeInTheDocument();
    });
  });

  describe('hideChrome prop', () => {
    it('should pass hideChrome=false by default to ImageUploadPage', () => {
      render(<StandaloneImagePage />);

      const imagePage = screen.getByTestId('image-upload-page');
      expect(imagePage).toHaveAttribute('data-hide-chrome', 'false');
    });

    it('should pass hideChrome=true to ImageUploadPage when set', () => {
      render(<StandaloneImagePage hideChrome={true} />);

      const imagePage = screen.getByTestId('image-upload-page');
      expect(imagePage).toHaveAttribute('data-hide-chrome', 'true');
    });

    it('should pass hideChrome correctly with routerType="none"', () => {
      render(<StandaloneImagePage routerType="none" hideChrome={true} />);

      const imagePage = screen.getByTestId('image-upload-page');
      expect(imagePage).toHaveAttribute('data-hide-chrome', 'true');
    });
  });

  describe('embedded auth mode', () => {
    it('should show error when useEmbeddedAuth is true but no projectId', () => {
      render(<StandaloneImagePage useEmbeddedAuth={true} />);

      expect(screen.getByText(/Configuration Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Descope Project ID is required/i)).toBeInTheDocument();
    });

    it('should render with AuthProvider when useEmbeddedAuth is true and projectId is provided', () => {
      render(
        <StandaloneImagePage
          useEmbeddedAuth={true}
          descopeProjectId="test-project-id"
        />
      );

      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.queryByText(/Configuration Error/i)).not.toBeInTheDocument();
    });

    it('should pass hideChrome through when using embedded auth', () => {
      render(
        <StandaloneImagePage
          useEmbeddedAuth={true}
          descopeProjectId="test-project-id"
          hideChrome={true}
        />
      );

      const imagePage = screen.getByTestId('image-upload-page');
      expect(imagePage).toHaveAttribute('data-hide-chrome', 'true');
    });
  });

  describe('provider wrapping', () => {
    it('should wrap content with TenantProvider', () => {
      render(<StandaloneImagePage />);

      expect(screen.getByTestId('tenant-provider')).toBeInTheDocument();
    });

    it('should render ImageUploadPage inside TenantProvider', () => {
      render(<StandaloneImagePage />);

      const tenantProvider = screen.getByTestId('tenant-provider');
      expect(tenantProvider).toContainElement(screen.getByTestId('image-upload-page'));
    });
  });
});
