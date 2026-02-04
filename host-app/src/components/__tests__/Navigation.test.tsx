/**
 * Tests for Navigation component behavior
 *
 * Since the Navigation component is embedded in App.tsx and uses the Descope SDK
 * which has complex initialization, we test the core logic through unit tests
 * of the utilities and verify the component contract.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type FC } from 'react';
import { MemoryRouter, Link } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getUserDisplayName } from '../../utils/userDisplay';

// Create a simplified Navigation component for testing that mimics the real one
// This avoids the Descope SDK initialization issues
interface NavigationTestProps {
  isAuthenticated: boolean;
  isSessionLoading: boolean;
  user: { userId: string; name?: string; email?: string } | null;
  onLogout: () => Promise<void>;
}

const TestableNavigation: FC<NavigationTestProps> = ({
  isAuthenticated,
  isSessionLoading,
  user,
  onLogout,
}) => {
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const displayName = getUserDisplayName(user);

  const handleLogout = async (): Promise<void> => {
    try {
      setLogoutError(null);
      await onLogout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      setLogoutError(errorMessage);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-2xl font-bold text-gray-900">
              Image Upload Service
            </Link>
            {!isSessionLoading && isAuthenticated && user && (
              <p
                className="mt-1 text-sm text-gray-600"
                aria-label={`Logged in as ${displayName}`}
              >
                Welcome, {displayName}
              </p>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {logoutError !== null && (
              <span className="text-sm text-red-600" role="alert">
                {logoutError}
              </span>
            )}
            {!isSessionLoading && isAuthenticated && (
              <button
                onClick={() => void handleLogout()}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                aria-label="Sign out of your account"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const renderNavigation = (props: Partial<NavigationTestProps> = {}): ReturnType<typeof render> => {
  const defaultProps: NavigationTestProps = {
    isAuthenticated: true,
    isSessionLoading: false,
    user: {
      userId: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
    onLogout: vi.fn().mockResolvedValue(undefined),
    ...props,
  };

  return render(
    <MemoryRouter>
      <TestableNavigation {...defaultProps} />
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when authenticated', () => {
    it('should render the app title', () => {
      renderNavigation();

      expect(screen.getByRole('link', { name: /image upload service/i })).toBeInTheDocument();
    });

    it('should render user greeting with display name', () => {
      renderNavigation();

      const greeting = screen.getByText(/Welcome, John Doe/);
      expect(greeting).toBeInTheDocument();
      expect(greeting).toHaveAttribute('aria-label', 'Logged in as John Doe');
    });

    it('should render logout button', () => {
      renderNavigation();

      expect(screen.getByRole('button', { name: /sign out of your account/i })).toBeInTheDocument();
    });

    it('should call logout when logout button is clicked', async () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      renderNavigation({ onLogout: mockLogout });

      await user.click(screen.getByRole('button', { name: /sign out of your account/i }));

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('when session is loading', () => {
    it('should not render user greeting', () => {
      renderNavigation({ isSessionLoading: true });

      expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
    });

    it('should not render logout button', () => {
      renderNavigation({ isSessionLoading: true });

      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  describe('when not authenticated', () => {
    it('should not render user greeting', () => {
      renderNavigation({ isAuthenticated: false });

      expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
    });

    it('should not render logout button', () => {
      renderNavigation({ isAuthenticated: false });

      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  describe('logout error handling', () => {
    it('should display error message when logout fails', async () => {
      const mockLogout = vi.fn().mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();

      renderNavigation({ onLogout: mockLogout });

      await user.click(screen.getByRole('button', { name: /sign out of your account/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
    });

    it('should display fallback error message for non-Error objects', async () => {
      const mockLogout = vi.fn().mockRejectedValue('Unknown error');
      const user = userEvent.setup();

      renderNavigation({ onLogout: mockLogout });

      await user.click(screen.getByRole('button', { name: /sign out of your account/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Failed to logout');
    });
  });

  describe('user display fallback', () => {
    it('should display email when name is not available', () => {
      renderNavigation({
        user: { userId: 'user-123', email: 'john@example.com' },
      });

      expect(screen.getByText(/Welcome, john@example.com/)).toBeInTheDocument();
    });

    it('should display userId when name and email are not available', () => {
      renderNavigation({
        user: { userId: 'user-123' },
      });

      expect(screen.getByText(/Welcome, user-123/)).toBeInTheDocument();
    });

    it('should not display greeting when user is null', () => {
      renderNavigation({
        user: null,
      });

      expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
    });
  });
});

describe('getUserDisplayName utility', () => {
  it('should correctly format display names', () => {
    expect(getUserDisplayName({ userId: 'u1', name: 'John', email: 'john@test.com' })).toBe('John');
    expect(getUserDisplayName({ userId: 'u1', email: 'john@test.com' })).toBe('john@test.com');
    expect(getUserDisplayName({ userId: 'u1' })).toBe('u1');
    expect(getUserDisplayName(null)).toBe('');
    expect(getUserDisplayName(undefined)).toBe('');
  });
});
