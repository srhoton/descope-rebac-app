package com.fullbay.memberservice;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.fullbay.memberservice.model.ErrorResponse;
import com.fullbay.memberservice.model.UserInfo;
import com.fullbay.memberservice.service.MemberService;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/** REST resource for looking up Descope users by ID. */
@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Users", description = "Operations for looking up Descope users")
public class UserResource {

  @Inject MemberService memberService;

  /**
   * Retrieves basic user info by Descope userId.
   *
   * @param userId The Descope user ID
   * @return HTTP 200 with user info, HTTP 404 if not found, or HTTP 500 on error
   */
  @GET
  @Path("/{userId}")
  @Operation(
      summary = "Get user by ID",
      description = "Retrieves basic user info by their Descope user ID")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "User found",
        content = @Content(schema = @Schema(implementation = UserInfo.class))),
    @APIResponse(
        responseCode = "404",
        description = "User not found",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response getUserById(
      @Parameter(description = "Descope user ID", required = true) @PathParam("userId")
          String userId) {
    UserInfo userInfo = memberService.getUserById(userId);
    return Response.ok(userInfo).build();
  }
}
