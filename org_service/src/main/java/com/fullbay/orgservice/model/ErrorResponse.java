package com.fullbay.orgservice.model;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/** Standardized error response model for API errors. */
@Schema(description = "Error response information")
public class ErrorResponse {

  @Schema(description = "Error type", example = "Failed to create tenant")
  private final String error;

  @Schema(description = "Detailed error message", example = "Tenant name cannot be empty")
  private final String message;

  /**
   * Creates a new ErrorResponse.
   *
   * @param error The error type or category
   * @param message The detailed error message
   */
  public ErrorResponse(String error, String message) {
    this.error = error;
    this.message = message;
  }

  /**
   * Gets the error type.
   *
   * @return The error type
   */
  public String getError() {
    return error;
  }

  /**
   * Gets the detailed error message.
   *
   * @return The error message
   */
  public String getMessage() {
    return message;
  }
}
