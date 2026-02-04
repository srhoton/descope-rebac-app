/**
 * Tests for ImageUploadPage component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploadPage } from '../ImageUploadPage';

// Mock the useDescope hook
const mockLogout = vi.fn();
vi.mock('../../hooks/useDescope', () => ({
  useDescope: vi.fn(() => ({
    user: {
      userId: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
    logout: mockLogout,
    isAuthenticated: true,
    isLoading: false,
  })),
}));

// Mock child components to isolate tests
vi.mock('../../components/ImageUploader', () => ({
  ImageUploader: ({ onUploadComplete }: { onUploadComplete: () => void }) => (
    <div data-testid="image-uploader">
      <button onClick={onUploadComplete}>Upload</button>
    </div>
  ),
}));

vi.mock('../../components/ImageGallery', () => ({
  ImageGallery: ({ refreshTrigger }: { refreshTrigger: number }) => (
    <div data-testid="image-gallery" data-refresh={refreshTrigger}>
      Gallery
    </div>
  ),
}));

describe('ImageUploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when hideChrome is false (default)', () => {
    it('should render header with title', () => {
      render(<ImageUploadPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Image Upload Service'
      );
    });

    it('should render user greeting with display name', () => {
      render(<ImageUploadPage />);

      const greeting = screen.getByText(/Welcome, John Doe/);
      expect(greeting).toBeInTheDocument();
      expect(greeting).toHaveAttribute('aria-label', 'Logged in as John Doe');
    });

    it('should render logout button', () => {
      render(<ImageUploadPage />);

      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should call logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageUploadPage />);

      await user.click(screen.getByRole('button', { name: /logout/i }));

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should render footer with Descope link', () => {
      render(<ImageUploadPage />);

      const descopeLink = screen.getByRole('link', { name: /descope/i });
      expect(descopeLink).toHaveAttribute('href', 'https://www.descope.com');
      expect(descopeLink).toHaveAttribute('target', '_blank');
      expect(descopeLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should apply min-h-screen bg-gray-50 classes to container', () => {
      const { container } = render(<ImageUploadPage />);

      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50');
    });
  });

  describe('when hideChrome is true', () => {
    it('should not render header', () => {
      render(<ImageUploadPage hideChrome={true} />);

      expect(screen.queryByRole('heading', { level: 1, name: /image upload service/i })).not.toBeInTheDocument();
    });

    it('should not render user greeting', () => {
      render(<ImageUploadPage hideChrome={true} />);

      expect(screen.queryByText(/Welcome, John Doe/)).not.toBeInTheDocument();
    });

    it('should not render logout button', () => {
      render(<ImageUploadPage hideChrome={true} />);

      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    });

    it('should not render footer', () => {
      render(<ImageUploadPage hideChrome={true} />);

      expect(screen.queryByRole('link', { name: /descope/i })).not.toBeInTheDocument();
    });

    it('should not apply min-h-screen bg-gray-50 classes to container', () => {
      const { container } = render(<ImageUploadPage hideChrome={true} />);

      const rootDiv = container.firstChild;
      expect(rootDiv).not.toHaveClass('min-h-screen');
      expect(rootDiv).not.toHaveClass('bg-gray-50');
    });
  });

  describe('main content (always rendered)', () => {
    it('should render upload section', () => {
      render(<ImageUploadPage />);

      expect(screen.getByRole('heading', { level: 2, name: /upload image/i })).toBeInTheDocument();
      expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    });

    it('should render gallery section', () => {
      render(<ImageUploadPage />);

      expect(screen.getByRole('heading', { level: 2, name: /your images/i })).toBeInTheDocument();
      expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
    });

    it('should render main content when hideChrome is true', () => {
      render(<ImageUploadPage hideChrome={true} />);

      expect(screen.getByRole('heading', { level: 2, name: /upload image/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /your images/i })).toBeInTheDocument();
    });

    it('should refresh gallery when upload completes', async () => {
      const user = userEvent.setup();
      render(<ImageUploadPage />);

      const gallery = screen.getByTestId('image-gallery');
      expect(gallery).toHaveAttribute('data-refresh', '0');

      // Simulate upload complete
      await user.click(screen.getByRole('button', { name: /upload/i }));

      expect(gallery).toHaveAttribute('data-refresh', '1');
    });
  });
});

describe('ImageUploadPage - user display fallback', () => {
  it('should display email when name is not available', async () => {
    // Re-mock with user without name
    const { useDescope } = await import('../../hooks/useDescope');
    vi.mocked(useDescope).mockReturnValue({
      user: {
        userId: 'user-123',
        email: 'john@example.com',
      },
      logout: mockLogout,
      isAuthenticated: true,
      isLoading: false,
    });

    render(<ImageUploadPage />);

    expect(screen.getByText(/Welcome, john@example.com/)).toBeInTheDocument();
  });

  it('should display userId when name and email are not available', async () => {
    const { useDescope } = await import('../../hooks/useDescope');
    vi.mocked(useDescope).mockReturnValue({
      user: {
        userId: 'user-123',
      },
      logout: mockLogout,
      isAuthenticated: true,
      isLoading: false,
    });

    render(<ImageUploadPage />);

    expect(screen.getByText(/Welcome, user-123/)).toBeInTheDocument();
  });
});
