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

import io.quarkus.logging.Log;

/** REST resource for managing Descope FGA relation tuples. */
@Path("/relations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RelationResource {

  @Inject RelationService relationService;

  /**
   * Creates one or more relation tuples.
   *
   * @param request The relation creation request
   * @return HTTP 201 on success or HTTP 500 on error
   */
  @POST
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
  public Response whoCanAccess(
      @QueryParam("resource") String resource,
      @QueryParam("relationDefinition") String relationDefinition,
      @QueryParam("namespace") String namespace) {
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
  public Response getResourceRelations(@PathParam("resourceId") String resourceId) {
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
  public Response getTargetAccess(@PathParam("targetId") String targetId) {
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
  public static class ErrorResponse {
    public String error;
    public String message;

    public ErrorResponse(String error, String message) {
      this.error = error;
      this.message = message;
    }
  }

  /** Success response model for successful operations. */
  public static class SuccessResponse {
    public String message;

    public SuccessResponse(String message) {
      this.message = message;
    }
  }

  /** Response model for who-can-access queries. */
  public static class TargetsResponse {
    public List<String> targets;

    public TargetsResponse(List<String> targets) {
      this.targets = targets;
    }
  }

  /** Response model for relation queries. */
  public static class RelationsResponse {
    public List<RelationTuple> relations;

    public RelationsResponse(List<RelationTuple> relations) {
      this.relations = relations;
    }
  }
}
