package com.fullbay.memberservice.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;

import com.descope.client.Config;
import com.descope.client.DescopeClient;
import com.descope.exception.DescopeException;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.quarkus.logging.Log;

/** Configuration class for Descope client initialization. */
@ApplicationScoped
public class DescopeConfig {

  @ConfigProperty(name = "descope.project.id")
  String projectId;

  @ConfigProperty(name = "descope.management.key")
  String managementKey;

  /**
   * Creates and configures a Descope client instance.
   *
   * @return A configured DescopeClient
   * @throws RuntimeException if client initialization fails
   */
  @Produces
  @ApplicationScoped
  public DescopeClient descopeClient() {
    try {
      Config config = Config.builder().projectId(projectId).managementKey(managementKey).build();
      return new DescopeClient(config);
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to initialize Descope client: %s", e.getMessage());
      throw new RuntimeException("Failed to initialize Descope client", e);
    }
  }
}
