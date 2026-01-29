package com.fullbay.orgservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request object for creating or updating a tenant.
 */
public class TenantRequest {

  @JsonProperty("name")
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
