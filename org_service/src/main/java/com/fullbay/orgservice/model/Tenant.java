package com.fullbay.orgservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/** Represents a Descope tenant with basic information. */
@Schema(description = "Descope tenant information")
public class Tenant {

  @JsonProperty("id")
  @Schema(description = "Unique tenant identifier", example = "T123456789")
  private String id;

  @JsonProperty("name")
  @Schema(description = "Tenant name", example = "Acme Corporation")
  private String name;

  public Tenant() {}

  public Tenant(String id, String name) {
    this.id = id;
    this.name = name;
  }

  /**
   * Gets the tenant ID.
   *
   * @return The tenant ID
   */
  public String getId() {
    return id;
  }

  /**
   * Sets the tenant ID.
   *
   * @param id The tenant ID
   */
  public void setId(String id) {
    this.id = id;
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
