package com.fullbay.orgservice;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.descope.exception.DescopeException;
import com.fullbay.orgservice.model.PaginatedResponse;
import com.fullbay.orgservice.model.Tenant;
import com.fullbay.orgservice.model.TenantRequest;
import com.fullbay.orgservice.service.TenantService;

import io.quarkus.logging.Log;

/** REST resource for managing Descope tenants. */
@Path("/tenants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TenantResource {

  @Inject TenantService tenantService;

  /**
   * Creates a new tenant.
   *
   * @param request The tenant creation request
   * @return HTTP 201 with the created tenant or HTTP 500 on error
   */
  @POST
  public Response createTenant(TenantRequest request) {
    try {
      Tenant tenant = tenantService.createTenant(request);
      return Response.status(Response.Status.CREATED).entity(tenant).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to create tenant: %s", e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to create tenant", e.getMessage()))
          .build();
    }
  }

  /**
   * Retrieves a tenant by ID.
   *
   * @param tenantId The tenant ID
   * @return HTTP 200 with the tenant, HTTP 404 if not found, or HTTP 500 on error
   */
  @GET
  @Path("/{tenantId}")
  public Response getTenant(@PathParam("tenantId") String tenantId) {
    try {
      Tenant tenant = tenantService.getTenant(tenantId);
      return Response.ok(tenant).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to retrieve tenant %s: %s", tenantId, e.getMessage());
      if (e.getMessage() != null && e.getMessage().contains("not found")) {
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ErrorResponse("Tenant not found", e.getMessage()))
            .build();
      }
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to retrieve tenant", e.getMessage()))
          .build();
    }
  }

  /**
   * Retrieves all tenants with pagination.
   *
   * @param page The page number (0-indexed, default 0)
   * @param pageSize The number of items per page (default 20)
   * @return HTTP 200 with paginated tenants or HTTP 500 on error
   */
  @GET
  public Response getAllTenants(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
    try {
      PaginatedResponse<Tenant> response = tenantService.getAllTenants(page, pageSize);
      return Response.ok(response).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to retrieve tenants: %s", e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to retrieve tenants", e.getMessage()))
          .build();
    }
  }

  /**
   * Updates an existing tenant.
   *
   * @param tenantId The tenant ID
   * @param request The tenant update request
   * @return HTTP 200 with the updated tenant or HTTP 500 on error
   */
  @PUT
  @Path("/{tenantId}")
  public Response updateTenant(@PathParam("tenantId") String tenantId, TenantRequest request) {
    try {
      Tenant tenant = tenantService.updateTenant(tenantId, request);
      return Response.ok(tenant).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to update tenant %s: %s", tenantId, e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to update tenant", e.getMessage()))
          .build();
    }
  }

  /**
   * Deletes a tenant by ID.
   *
   * @param tenantId The tenant ID
   * @return HTTP 204 on success or HTTP 500 on error
   */
  @DELETE
  @Path("/{tenantId}")
  public Response deleteTenant(@PathParam("tenantId") String tenantId) {
    try {
      tenantService.deleteTenant(tenantId);
      return Response.noContent().build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to delete tenant %s: %s", tenantId, e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to delete tenant", e.getMessage()))
          .build();
    }
  }

  /** Error response model for API errors. */
  public static class ErrorResponse {
    public String error;
    public String message;

    public ErrorResponse(String error, String message) {
      this.error = error;
      this.message = message;
    }
  }
}
