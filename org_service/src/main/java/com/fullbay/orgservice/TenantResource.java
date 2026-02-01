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

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import io.quarkus.logging.Log;

/** REST resource for managing Descope tenants. */
@Path("/tenants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Tenants", description = "Operations for managing Descope tenants")
public class TenantResource {

  @Inject TenantService tenantService;

  /**
   * Creates a new tenant.
   *
   * @param request The tenant creation request
   * @return HTTP 201 with the created tenant or HTTP 500 on error
   */
  @POST
  @Operation(
      summary = "Create a new tenant",
      description = "Creates a new tenant in the Descope project")
  @APIResponses({
    @APIResponse(
        responseCode = "201",
        description = "Tenant created successfully",
        content = @Content(schema = @Schema(implementation = Tenant.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
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
  @Operation(
      summary = "Get tenant by ID",
      description = "Retrieves a tenant by its unique identifier")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Tenant found",
        content = @Content(schema = @Schema(implementation = Tenant.class))),
    @APIResponse(
        responseCode = "404",
        description = "Tenant not found",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response getTenant(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId) {
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
  @Operation(
      summary = "List all tenants",
      description = "Retrieves all tenants with pagination support")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Tenants retrieved successfully",
        content = @Content(schema = @Schema(implementation = PaginatedResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response getAllTenants(
      @Parameter(description = "Page number (0-indexed)", example = "0")
          @QueryParam("page")
          @DefaultValue("0")
          int page,
      @Parameter(description = "Number of items per page", example = "20")
          @QueryParam("pageSize")
          @DefaultValue("20")
          int pageSize) {
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
  @Operation(summary = "Update tenant", description = "Updates an existing tenant's information")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Tenant updated successfully",
        content = @Content(schema = @Schema(implementation = Tenant.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response updateTenant(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId,
      TenantRequest request) {
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
  @Operation(summary = "Delete tenant", description = "Deletes a tenant by its unique identifier")
  @APIResponses({
    @APIResponse(responseCode = "204", description = "Tenant deleted successfully"),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response deleteTenant(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId) {
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
  @Schema(description = "Error response information")
  public static class ErrorResponse {
    @Schema(description = "Error type", example = "Failed to create tenant")
    public String error;

    @Schema(description = "Detailed error message", example = "Tenant name cannot be empty")
    public String message;

    public ErrorResponse(String error, String message) {
      this.error = error;
      this.message = message;
    }
  }
}
