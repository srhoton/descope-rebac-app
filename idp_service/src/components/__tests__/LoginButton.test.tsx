import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginButton from '../LoginButton';
import { useDescope, useSession } from '@descope/react-sdk';

// Mock the Descope SDK
vi.mock('@descope/react-sdk', () => ({
  useDescope: vi.fn(),
  useSession: vi.fn(),
}));

describe('LoginButton', () => {
  it('should render login button', () => {
    const mockFlow = {
      start: vi.fn(),
    };

    vi.mocked(useDescope).mockReturnValue({
      flow: mockFlow,
    } as any);

    vi.mocked(useSession).mockReturnValue({
      isSessionLoading: false,
    } as any);

    render(<LoginButton />);

    const button = screen.getByRole('button', { name: /sign in with descope/i });
    expect(button).toBeInTheDocument();
  });

  it('should show loading state when session is loading', () => {
    vi.mocked(useDescope).mockReturnValue({
      flow: { start: vi.fn() },
    } as any);

    vi.mocked(useSession).mockReturnValue({
      isSessionLoading: true,
    } as any);

    render(<LoginButton />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should call flow.start when clicked', () => {
    const mockStart = vi.fn().mockResolvedValue(undefined);
    const mockFlow = {
      start: mockStart,
    };

    vi.mocked(useDescope).mockReturnValue({
      flow: mockFlow,
    } as any);

    render(<LoginButton />);

    const button = screen.getByRole('button', { name: /sign in with descope/i });
    fireEvent.click(button);

    expect(mockStart).toHaveBeenCalledWith(
      'sign-up-or-in',
      {
        redirectUrl: expect.stringContaining('/profile'),
      }
    );
  });

  it('should be disabled when loading', () => {
    vi.mocked(useDescope).mockReturnValue({
      flow: { start: vi.fn() },
    } as any);

    vi.mocked(useSession).mockReturnValue({
      isSessionLoading: true,
    } as any);

    render(<LoginButton />);

    const button = screen.getByRole('button', { name: /sign in with descope/i });
    expect(button).toBeDisabled();
  });
});
