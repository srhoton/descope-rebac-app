package com.fullbay.memberservice.exception;

import java.util.stream.Collectors;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import com.fullbay.memberservice.model.ErrorResponse;

/** Exception handler specifically for validation constraint violations. */
@Provider
public class ValidationExceptionHandler implements ExceptionMapper<ConstraintViolationException> {

  @Override
  public Response toResponse(ConstraintViolationException exception) {
    String violations =
        exception.getConstraintViolations().stream()
            .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
            .collect(Collectors.joining(", "));
    return Response.status(Response.Status.BAD_REQUEST)
        .entity(new ErrorResponse("Validation failed", violations))
        .build();
  }
}
