package com.fullbay.memberservice.exception;

import java.util.stream.Collectors;

import jakarta.annotation.Priority;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import com.descope.exception.DescopeException;
import com.fullbay.memberservice.model.ErrorResponse;

import io.quarkus.logging.Log;

/** Global exception handler for mapping exceptions to HTTP responses. */
@Provider
@Priority(Priorities.USER)
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {

  @Override
  public Response toResponse(Exception exception) {
    if (exception instanceof MemberNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND)
          .entity(new ErrorResponse("Member not found", e.getMessage()))
          .build();
    }

    if (exception instanceof ConstraintViolationException e) {
      String violations =
          e.getConstraintViolations().stream()
              .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
              .collect(Collectors.joining(", "));
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(new ErrorResponse("Validation failed", violations))
          .build();
    }

    if (exception instanceof IllegalArgumentException e) {
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(new ErrorResponse("Invalid request", e.getMessage()))
          .build();
    }

    if (exception instanceof DescopeException e) {
      Log.errorf(e, "Descope API error: %s", e.getMessage());
      // Return generic message to client, don't expose internal details
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity(new ErrorResponse("Service error", "An error occurred processing your request"))
          .build();
    }

    // Generic error handling
    Log.errorf(exception, "Unexpected error: %s", exception.getMessage());
    return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
        .entity(new ErrorResponse("Internal error", "An unexpected error occurred"))
        .build();
  }
}
