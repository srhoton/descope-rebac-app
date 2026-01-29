package com.fullbay.orgservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a Descope tenant with basic information.
 */
public class Tenant {

  @JsonProperty("id")
  private String id;

  @JsonProperty("name")
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
