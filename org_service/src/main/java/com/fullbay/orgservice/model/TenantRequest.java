package com.fullbay.orgservice.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonProperty;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/** Request object for creating or updating a tenant. */
@Schema(description = "Request payload for creating or updating a tenant")
public class TenantRequest {

  @JsonProperty("name")
  @NotBlank(message = "Tenant name is required")
  @Size(min = 1, max = 255, message = "Tenant name must be between 1 and 255 characters")
  @Schema(description = "Tenant name", required = true, example = "Acme Corporation")
  private String name;

  public TenantRequest() {}

  public TenantRequest(String name) {
    this.name = name;
  }

  /**
   * Gets the tenant name.
   *
   * @return The tenant name
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the tenant name.
   *
   * @param name The tenant name
   */
  public void setName(String name) {
    this.name = name;
  }
}
