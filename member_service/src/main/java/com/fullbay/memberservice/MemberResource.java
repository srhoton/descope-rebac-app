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

import io.quarkus.logging.Log;

/** REST resource for managing Descope members within tenants. */
@Path("/tenants/{tenantId}/members")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
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
  public Response createMember(@PathParam("tenantId") String tenantId, MemberRequest request) {
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
  public Response getMember(
      @PathParam("tenantId") String tenantId, @PathParam("loginId") String loginId) {
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
  public Response getAllMembers(
      @PathParam("tenantId") String tenantId,
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
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
  public Response updateMember(
      @PathParam("tenantId") String tenantId,
      @PathParam("loginId") String loginId,
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
  public Response deleteMember(
      @PathParam("tenantId") String tenantId, @PathParam("loginId") String loginId) {
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
  public static class ErrorResponse {
    public String error;
    public String message;

    public ErrorResponse(String error, String message) {
      this.error = error;
      this.message = message;
    }
  }
}
