package com.fullbay.rebacservice.config;

import static org.mockito.Mockito.mock;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

import com.descope.client.DescopeClient;

/**
 * Test producer that provides a mock DescopeClient for testing. This producer takes precedence over
 * the production DescopeConfig producer because that one is marked with @DefaultBean.
 */
@ApplicationScoped
public class MockDescopeClientProducer {

  private static final DescopeClient MOCK_CLIENT = mock(DescopeClient.class);

  /**
   * Returns a static mock DescopeClient instance for testing. This takes precedence over
   * DescopeConfig.descopeClient() because that method is annotated with @DefaultBean.
   *
   * @return A mock DescopeClient
   */
  @Produces
  @Singleton
  public DescopeClient descopeClient() {
    return MOCK_CLIENT;
  }

  /**
   * Returns the static mock instance for test configuration.
   *
   * @return The mock DescopeClient instance
   */
  public static DescopeClient getMockClient() {
    return MOCK_CLIENT;
  }
}
