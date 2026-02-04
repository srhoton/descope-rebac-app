/* eslint-disable import/order -- vi.mock calls must appear before the modules they mock for proper hoisting */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, waitFor } from '@testing-library/react';

// Type for the token getter function
type TokenGetter = () => string | undefined;

// Mock the Descope SDK
const mockUseSession = vi.fn<[], { sessionToken: string | null }>();
vi.mock('@descope/react-sdk', () => ({
  useSession: (): { sessionToken: string | null } => mockUseSession(),
}));

// Mock local authTokenProvider
const mockSetTokenGetter = vi.fn<[TokenGetter], void>();
vi.mock('../../services/authTokenProvider', () => ({
  setTokenGetter: (getter: TokenGetter): void => mockSetTokenGetter(getter),
}));

// Import after mocks are set up
import { AuthTokenBridge } from '../AuthTokenBridge';

const S3_SERVICE_TOKEN_KEY = '__s3_service_auth_token_getter__';

// Helper to safely get the token getter from mock calls
function getTokenGetterFromMock(
  mock: Mock<[TokenGetter], void>,
  callIndex: number
): TokenGetter | undefined {
  const calls: Array<[TokenGetter]> = mock.mock.calls;
  return calls[callIndex]?.[0];
}

describe('AuthTokenBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up window global
    delete (window as unknown as Record<string, unknown>)[S3_SERVICE_TOKEN_KEY];
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)[S3_SERVICE_TOKEN_KEY];
  });

  it('should render children', (): void => {
    mockUseSession.mockReturnValue({ sessionToken: 'test-token' });

    const { getByText } = render(
      <AuthTokenBridge>
        <div>Test Child</div>
      </AuthTokenBridge>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should set up local token getter when sessionToken is available', async (): Promise<void> => {
    const testToken = 'test-session-token';
    mockUseSession.mockReturnValue({ sessionToken: testToken });

    render(
      <AuthTokenBridge>
        <div>Child</div>
      </AuthTokenBridge>
    );

    await waitFor(() => {
      expect(mockSetTokenGetter).toHaveBeenCalledTimes(1);
    });

    // Get the token getter that was passed to setTokenGetter
    const tokenGetter = getTokenGetterFromMock(mockSetTokenGetter, 0);
    expect(tokenGetter).toBeDefined();
    expect(tokenGetter?.()).toBe(testToken);
  });

  it('should set up s3_service token getter on window', async (): Promise<void> => {
    const testToken = 'test-token-for-s3';
    mockUseSession.mockReturnValue({ sessionToken: testToken });

    render(
      <AuthTokenBridge>
        <div>Child</div>
      </AuthTokenBridge>
    );

    await waitFor(() => {
      const getter = (window as unknown as Record<string, unknown>)[S3_SERVICE_TOKEN_KEY] as TokenGetter | undefined;
      expect(getter).toBeDefined();
      expect(getter?.()).toBe(testToken);
    });
  });

  it('should return undefined from token getter when sessionToken is null', async (): Promise<void> => {
    mockUseSession.mockReturnValue({ sessionToken: null });

    render(
      <AuthTokenBridge>
        <div>Child</div>
      </AuthTokenBridge>
    );

    await waitFor(() => {
      expect(mockSetTokenGetter).toHaveBeenCalled();
    });

    const tokenGetter = getTokenGetterFromMock(mockSetTokenGetter, 0);
    expect(tokenGetter?.()).toBeUndefined();
  });

  it('should update token getter when sessionToken changes', async (): Promise<void> => {
    mockUseSession.mockReturnValue({ sessionToken: 'initial-token' });

    const { rerender } = render(
      <AuthTokenBridge>
        <div>Child</div>
      </AuthTokenBridge>
    );

    await waitFor(() => {
      expect(mockSetTokenGetter).toHaveBeenCalledTimes(1);
    });

    // Update session token
    mockUseSession.mockReturnValue({ sessionToken: 'updated-token' });

    // Re-render to trigger useEffect
    rerender(
      <AuthTokenBridge>
        <div>Child</div>
      </AuthTokenBridge>
    );

    await waitFor(() => {
      expect(mockSetTokenGetter).toHaveBeenCalledTimes(2);
    });

    // Check that the new token getter returns the updated token
    const tokenGetter = getTokenGetterFromMock(mockSetTokenGetter, 1);
    expect(tokenGetter?.()).toBe('updated-token');
  });
});
