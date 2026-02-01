package com.fullbay.rebacservice.config;

import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

import com.descope.client.Config;
import com.descope.client.DescopeClient;
import com.descope.exception.DescopeException;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.quarkus.arc.DefaultBean;
import io.quarkus.logging.Log;

/** Configuration class for Descope client initialization. */
@Singleton
public class DescopeConfig {

  @ConfigProperty(name = "descope.project.id")
  String projectId;

  @ConfigProperty(name = "descope.management.key")
  String managementKey;

  /**
   * Creates and configures a Descope client instance.
   *
   * @return A configured DescopeClient, or null if initialization fails (for testing)
   */
  @Produces
  @Singleton
  @DefaultBean
  public DescopeClient descopeClient() {
    try {
      Config config = Config.builder().projectId(projectId).managementKey(managementKey).build();
      return new DescopeClient(config);
    } catch (DescopeException e) {
      Log.warnf(
          "Descope client initialization failed (may be expected in test environment): %s",
          e.getMessage());
      return null;
    }
  }
}
