package com.fullbay.orgservice.service;

import com.descope.client.DescopeClient;
import com.descope.exception.DescopeException;
import com.descope.model.tenant.Tenant;

import com.fullbay.orgservice.model.PaginatedResponse;
import com.fullbay.orgservice.model.TenantRequest;

import io.quarkus.logging.Log;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing Descope tenants.
 */
@ApplicationScoped
public class TenantService {

  @Inject DescopeClient descopeClient;

  /**
   * Creates a new tenant.
   *
   * @param request The tenant creation request
   * @return The created tenant
   * @throws DescopeException If the tenant creation fails
   */
  public com.fullbay.orgservice.model.Tenant createTenant(TenantRequest request)
      throws DescopeException {
    Log.infof("Creating tenant with name: %s", request.getName());

    String tenantId =
        descopeClient
            .getManagementServices()
            .getTenantService()
            .create(request.getName(), Collections.emptyList(), new HashMap<>());

    Log.infof("Tenant created successfully with ID: %s", tenantId);

    return new com.fullbay.orgservice.model.Tenant(tenantId, request.getName());
  }

  /**
   * Retrieves a tenant by ID.
   *
   * @param tenantId The tenant ID
   * @return The tenant
   * @throws DescopeException If the tenant is not found or retrieval fails
   */
  public com.fullbay.orgservice.model.Tenant getTenant(String tenantId) throws DescopeException {
    Log.infof("Retrieving tenant with ID: %s", tenantId);

    Tenant descopeTenant =
        descopeClient.getManagementServices().getTenantService().load(tenantId);

    return new com.fullbay.orgservice.model.Tenant(descopeTenant.getId(), descopeTenant.getName());
  }

  /**
   * Updates an existing tenant.
   *
   * @param tenantId The tenant ID
   * @param request The tenant update request
   * @return The updated tenant
   * @throws DescopeException If the tenant update fails
   */
  public com.fullbay.orgservice.model.Tenant updateTenant(String tenantId, TenantRequest request)
      throws DescopeException {
    Log.infof("Updating tenant %s with name: %s", tenantId, request.getName());

    descopeClient
        .getManagementServices()
        .getTenantService()
        .update(tenantId, request.getName(), Collections.emptyList(), new HashMap<>());

    Log.infof("Tenant %s updated successfully", tenantId);

    return new com.fullbay.orgservice.model.Tenant(tenantId, request.getName());
  }

  /**
   * Deletes a tenant by ID.
   *
   * @param tenantId The tenant ID
   * @throws DescopeException If the tenant deletion fails
   */
  public void deleteTenant(String tenantId) throws DescopeException {
    Log.infof("Deleting tenant with ID: %s", tenantId);

    descopeClient.getManagementServices().getTenantService().delete(tenantId);

    Log.infof("Tenant %s deleted successfully", tenantId);
  }

  /**
   * Retrieves all tenants with pagination support.
   *
   * @param page The page number (0-indexed)
   * @param pageSize The number of items per page
   * @return A paginated response containing tenants
   * @throws DescopeException If tenant retrieval fails
   */
  public PaginatedResponse<com.fullbay.orgservice.model.Tenant> getAllTenants(
      int page, int pageSize) throws DescopeException {
    Log.infof("Retrieving all tenants - page: %d, pageSize: %d", page, pageSize);

    List<Tenant> allTenants = descopeClient.getManagementServices().getTenantService().loadAll();

    if (allTenants == null) {
      allTenants = Collections.emptyList();
    }

    long totalItems = allTenants.size();
    int startIndex = page * pageSize;
    int endIndex = Math.min(startIndex + pageSize, allTenants.size());

    List<com.fullbay.orgservice.model.Tenant> paginatedTenants;
    if (startIndex >= allTenants.size()) {
      paginatedTenants = Collections.emptyList();
    } else {
      paginatedTenants =
          allTenants.subList(startIndex, endIndex).stream()
              .map(t -> new com.fullbay.orgservice.model.Tenant(t.getId(), t.getName()))
              .collect(Collectors.toList());
    }

    Log.infof("Retrieved %d tenants out of %d total", paginatedTenants.size(), totalItems);

    return new PaginatedResponse<>(paginatedTenants, page, pageSize, totalItems);
  }
}
