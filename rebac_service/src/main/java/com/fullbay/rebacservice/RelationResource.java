package com.fullbay.rebacservice;

import java.util.List;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.descope.exception.DescopeException;
import com.fullbay.rebacservice.model.RelationRequest;
import com.fullbay.rebacservice.model.RelationTuple;
import com.fullbay.rebacservice.service.RelationService;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import io.quarkus.logging.Log;

/** REST resource for managing Descope FGA relation tuples. */
@Path("/relations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(
    name = "Relations",
    description = "Operations for managing Fine-Grained Authorization relation tuples")
public class RelationResource {

  @Inject RelationService relationService;

  /**
   * Creates one or more relation tuples.
   *
   * @param request The relation creation request
   * @return HTTP 201 on success or HTTP 500 on error
   */
  @POST
  @Operation(
      summary = "Create relation tuples",
      description = "Creates one or more authorization relation tuples in the FGA system")
  @APIResponses({
    @APIResponse(
        responseCode = "201",
        description = "Relations created successfully",
        content = @Content(schema = @Schema(implementation = SuccessResponse.class))),
    @APIResponse(
        responseCode = "400",
        description = "Bad request - invalid input",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response createRelations(RelationRequest request) {
    try {
      if (request.getRelations() == null || request.getRelations().isEmpty()) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity(new ErrorResponse("Invalid request", "Relations list cannot be empty"))
            .build();
      }

      relationService.createRelations(request.getRelations());
      return Response.status(Response.Status.CREATED)
          .entity(
              new SuccessResponse(
                  "Created " + request.getRelations().size() + " relation tuple(s)"))
          .build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to create relations: %s", e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to create relations", e.getMessage()))
          .build();
    }
  }

  /**
   * Deletes one or more relation tuples.
   *
   * @param request The relation deletion request
   * @return HTTP 204 on success or HTTP 500 on error
   */
  @DELETE
  @Operation(
      summary = "Delete relation tuples",
      description = "Deletes one or more authorization relation tuples from the FGA system")
  @APIResponses({
    @APIResponse(responseCode = "204", description = "Relations deleted successfully"),
    @APIResponse(
        responseCode = "400",
        description = "Bad request - invalid input",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response deleteRelations(RelationRequest request) {
    try {
      if (request.getRelations() == null || request.getRelations().isEmpty()) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity(new ErrorResponse("Invalid request", "Relations list cannot be empty"))
            .build();
      }

      relationService.deleteRelations(request.getRelations());
      return Response.noContent().build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to delete relations: %s", e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to delete relations", e.getMessage()))
          .build();
    }
  }

  /**
   * Queries who can access a specific resource with a given relation.
   *
   * @param resource The resource identifier
   * @param relationDefinition The relation type
   * @param namespace The namespace
   * @return HTTP 200 with list of targets or HTTP 500 on error
   */
  @GET
  @Path("/who-can-access")
  @Operation(
      summary = "Query who can access resource",
      description =
          "Queries and returns a list of targets (users/entities) that can access a specific resource with the given relation")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Query successful",
        content = @Content(schema = @Schema(implementation = TargetsResponse.class))),
    @APIResponse(
        responseCode = "400",
        description = "Bad request - missing required parameters",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response whoCanAccess(
      @Parameter(description = "Resource identifier", required = true, example = "document:123")
          @QueryParam("resource")
          String resource,
      @Parameter(description = "Relation definition/type", required = true, example = "viewer")
          @QueryParam("relationDefinition")
          String relationDefinition,
      @Parameter(description = "Namespace for the resource", required = true, example = "documents")
          @QueryParam("namespace")
          String namespace) {
    try {
      if (resource == null || relationDefinition == null || namespace == null) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity(
                new ErrorResponse(
                    "Invalid request", "resource, relationDefinition, and namespace are required"))
            .build();
      }

      List<String> targets = relationService.whoCanAccess(resource, relationDefinition, namespace);
      return Response.ok(new TargetsResponse(targets)).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to query who can access: %s", e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to query who can access", e.getMessage()))
          .build();
    }
  }

  /**
   * Gets all relations for a specific resource.
   *
   * @param resourceId The resource identifier
   * @return HTTP 200 with list of relations or HTTP 500 on error
   */
  @GET
  @Path("/resource/{resourceId}")
  @Operation(
      summary = "Get resource relations",
      description =
          "Retrieves all authorization relation tuples associated with a specific resource")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Relations retrieved successfully",
        content = @Content(schema = @Schema(implementation = RelationsResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response getResourceRelations(
      @Parameter(description = "Resource identifier", required = true, example = "document:123")
          @PathParam("resourceId")
          String resourceId) {
    try {
      List<RelationTuple> relations = relationService.getResourceRelations(resourceId);
      return Response.ok(new RelationsResponse(relations)).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to get resource relations: %s", e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to get resource relations", e.getMessage()))
          .build();
    }
  }

  /**
   * Gets all resources a target can access.
   *
   * @param targetId The target/subject identifier
   * @return HTTP 200 with list of relations or HTTP 500 on error
   */
  @GET
  @Path("/target/{targetId}")
  @Operation(
      summary = "Get target access",
      description =
          "Retrieves all resources and their relations that a specific target (user/entity) can access")
  @APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Access information retrieved successfully",
        content = @Content(schema = @Schema(implementation = RelationsResponse.class))),
    @APIResponse(
        responseCode = "500",
        description = "Internal server error",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public Response getTargetAccess(
      @Parameter(
              description = "Target/subject identifier",
              required = true,
              example = "user:alice@example.com")
          @PathParam("targetId")
          String targetId) {
    try {
      List<RelationTuple> relations = relationService.getTargetAccess(targetId);
      return Response.ok(new RelationsResponse(relations)).build();
    } catch (DescopeException e) {
      Log.errorf(e, "Failed to get target access: %s", e.getMessage());
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Failed to get target access", e.getMessage()))
          .build();
    }
  }

  /** Error response model for API errors. */
  @Schema(description = "Error response information")
  public static class ErrorResponse {
    @Schema(description = "Error type", example = "Failed to create relations")
    public String error;

    @Schema(description = "Detailed error message", example = "Relations list cannot be empty")
    public String message;

    public ErrorResponse(String error, String message) {
      this.error = error;
      this.message = message;
    }
  }

  /** Success response model for successful operations. */
  @Schema(description = "Success response for operations")
  public static class SuccessResponse {
    @Schema(description = "Success message", example = "Created 2 relation tuple(s)")
    public String message;

    public SuccessResponse(String message) {
      this.message = message;
    }
  }

  /** Response model for who-can-access queries. */
  @Schema(description = "Response containing list of targets that can access a resource")
  public static class TargetsResponse {
    @Schema(
        description = "List of target identifiers",
        example = "[\"user:alice@example.com\", \"user:bob@example.com\"]")
    public List<String> targets;

    public TargetsResponse(List<String> targets) {
      this.targets = targets;
    }
  }

  /** Response model for relation queries. */
  @Schema(description = "Response containing list of relation tuples")
  public static class RelationsResponse {
    @Schema(description = "List of relation tuples")
    public List<RelationTuple> relations;

    public RelationsResponse(List<RelationTuple> relations) {
      this.relations = relations;
    }
  }
}
