/**
 * Tests for ImagesPage component
 *
 * Note: Since FullImagePage uses lazy-loaded federated modules which are difficult
 * to mock properly in tests, we test the component structure and prop passing
 * indirectly by verifying the component renders without errors.
 */

/* eslint-disable import/order -- vi.mock calls must appear before the modules they mock for clarity, even though vitest hoists them */
import { describe, it, expect, vi } from 'vitest';
import { Suspense, type ReactElement } from 'react';

// Mock react's lazy to return a simple component immediately
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: () => {
      const MockComponent = ({
        routerType,
        hideChrome,
      }: {
        routerType?: string;
        hideChrome?: boolean;
      }): ReactElement => (
        <div
          data-testid="standalone-image-page"
          data-router-type={routerType}
          data-hide-chrome={hideChrome?.toString()}
        >
          StandaloneImagePage
        </div>
      );
      return MockComponent;
    },
  };
});

// Mock the RemoteComponentWrapper
vi.mock('../../components/RemoteComponentWrapper', () => ({
  RemoteComponentWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="remote-wrapper">{children}</div>
  ),
}));

// Import after mocks are set up
import { render, screen } from '@testing-library/react';

import { FullImagePage } from '../ImagesPage';

describe('FullImagePage', () => {
  it('should render without crashing', () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <FullImagePage />
      </Suspense>
    );

    // The component should render the wrapper
    expect(screen.getByTestId('remote-wrapper')).toBeInTheDocument();
  });

  it('should render the mocked StandaloneImagePage with correct props', () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <FullImagePage />
      </Suspense>
    );

    const standaloneImagePage = screen.getByTestId('standalone-image-page');
    expect(standaloneImagePage).toBeInTheDocument();
    expect(standaloneImagePage).toHaveAttribute('data-router-type', 'none');
    expect(standaloneImagePage).toHaveAttribute('data-hide-chrome', 'true');
  });

  it('should wrap StandaloneImagePage in RemoteComponentWrapper', () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <FullImagePage />
      </Suspense>
    );

    const wrapper = screen.getByTestId('remote-wrapper');
    const standaloneImagePage = screen.getByTestId('standalone-image-page');
    expect(wrapper).toContainElement(standaloneImagePage);
  });
});
