package com.fullbay.memberservice;

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
import com.fullbay.memberservice.model.Member;
import com.fullbay.memberservice.model.MemberRequest;
import com.fullbay.memberservice.model.PaginatedResponse;
import com.fullbay.memberservice.service.MemberService;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import io.quarkus.logging.Log;

/** REST resource for managing Descope members within tenants. */
@Path("/tenants/{tenantId}/members")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Members", description = "Operations for managing Descope members within tenants")
public class MemberResource {

  @Inject MemberService memberService;

  /**
   * Creates a new member in the specified tenant.
   *
   * @param tenantId The tenant ID
   * @param request The member creation request
   * @return HTTP 201 with the created member or HTTP 500 on error
   */
  @POST
  @Operation(
      summary = "Create a new member",
      description = "Creates a new member in the specified tenant")
  @APIResponses({
    @APIResponse(
        responseCode = "201",
        description = "Member created successfully",
        content = @Content(schema = @Schema(implementation = Member.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response createMember(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId,
      MemberRequest request) {
    try {
      Member member = memberService.createMember(tenantId, request);
      return Response.status(Response.Status.CREATED).entity(member).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to create member in tenant %s: %s", tenantId, e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to create member", e.getMessage()))
          .build();
    }
  }

  /**
   * Retrieves a member by login ID from the specified tenant.
   *
   * @param tenantId The tenant ID
   * @param loginId The member's login ID
   * @return HTTP 200 with the member, HTTP 404 if not found, or HTTP 500 on error
   */
  @GET
  @Path("/{loginId}")
  @Operation(
      summary = "Get member by login ID",
      description = "Retrieves a member by their login ID from the specified tenant")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Member found",
        content = @Content(schema = @Schema(implementation = Member.class))),
    @APIResponse(
        responseCode = "404",
        description = "Member not found",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response getMember(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId,
      @Parameter(description = "Member login ID", required = true) @PathParam("loginId")
          String loginId) {
    try {
      Member member = memberService.getMember(tenantId, loginId);
      return Response.ok(member).build();
    } catch (DescopeException e) {
      Log.errorf(
          e, "Failed to retrieve member %s from tenant %s: %s", loginId, tenantId, e.getMessage());
      if (e.getMessage() != null && e.getMessage().contains("not found")) {
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ErrorResponse("Member not found", e.getMessage()))
            .build();
      }
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to retrieve member", e.getMessage()))
          .build();
    }
  }

  /**
   * Retrieves all members in the specified tenant with pagination.
   *
   * @param tenantId The tenant ID
   * @param page The page number (0-indexed, default 0)
   * @param pageSize The number of items per page (default 20)
   * @return HTTP 200 with paginated members or HTTP 500 on error
   */
  @GET
  @Operation(
      summary = "List all members",
      description = "Retrieves all members in the specified tenant with pagination support")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Members retrieved successfully",
        content = @Content(schema = @Schema(implementation = PaginatedResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response getAllMembers(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId,
      @Parameter(description = "Page number (0-indexed)", example = "0")
          @QueryParam("page")
          @DefaultValue("0")
          int page,
      @Parameter(description = "Number of items per page", example = "20")
          @QueryParam("pageSize")
          @DefaultValue("20")
          int pageSize) {
    try {
      PaginatedResponse<Member> response = memberService.getAllMembers(tenantId, page, pageSize);
      return Response.ok(response).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to retrieve members from tenant %s: %s", tenantId, e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to retrieve members", e.getMessage()))
          .build();
    }
  }

  /**
   * Updates an existing member in the specified tenant.
   *
   * @param tenantId The tenant ID
   * @param loginId The member's login ID
   * @param request The member update request
   * @return HTTP 200 with the updated member or HTTP 500 on error
   */
  @PUT
  @Path("/{loginId}")
  @Operation(
      summary = "Update member",
      description = "Updates an existing member's information in the specified tenant")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Member updated successfully",
        content = @Content(schema = @Schema(implementation = Member.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response updateMember(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId,
      @Parameter(description = "Member login ID", required = true) @PathParam("loginId")
          String loginId,
      MemberRequest request) {
    try {
      Member member = memberService.updateMember(tenantId, loginId, request);
      return Response.ok(member).build();
    } catch (DescopeException e) {
      Log.errorf(
          e, "Failed to update member %s in tenant %s: %s", loginId, tenantId, e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to update member", e.getMessage()))
          .build();
    }
  }

  /**
   * Deletes a member from the specified tenant.
   *
   * @param tenantId The tenant ID
   * @param loginId The member's login ID
   * @return HTTP 204 on success or HTTP 500 on error
   */
  @DELETE
  @Path("/{loginId}")
  @Operation(
      summary = "Delete member",
      description = "Deletes a member from the specified tenant by their login ID")
  @APIResponses({
    @APIResponse(responseCode = "204", description = "Member deleted successfully"),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response deleteMember(
      @Parameter(description = "Tenant unique identifier", required = true) @PathParam("tenantId")
          String tenantId,
      @Parameter(description = "Member login ID", required = true) @PathParam("loginId")
          String loginId) {
    try {
      memberService.deleteMember(tenantId, loginId);
      return Response.noContent().build();
    } catch (DescopeException e) {
      Log.errorf(
          e, "Failed to delete member %s from tenant %s: %s", loginId, tenantId, e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to delete member", e.getMessage()))
          .build();
    }
  }

  /** Error response model for API errors. */
  @Schema(description = "Error response information")
  public static class ErrorResponse {
    @Schema(description = "Error type", example = "Failed to create member")
    public String error;

    @Schema(description = "Detailed error message", example = "Member email cannot be empty")
    public String message;

    public ErrorResponse(String error, String message) {
      this.error = error;
      this.message = message;
    }
  }
}
