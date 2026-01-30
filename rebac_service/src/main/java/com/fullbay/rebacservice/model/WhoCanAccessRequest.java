package com.fullbay.rebacservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Request model for who-can-access query. */
public class WhoCanAccessRequest {

  @JsonProperty("resource")
  private String resource;

  @JsonProperty("relationDefinition")
  private String relationDefinition;

  @JsonProperty("namespace")
  private String namespace;

  /** Default constructor for JSON deserialization. */
  public WhoCanAccessRequest() {}

  /**
   * Creates a new WhoCanAccessRequest.
   *
   * @param resource The resource identifier
   * @param relationDefinition The relation type
   * @param namespace The namespace
   */
  public WhoCanAccessRequest(String resource, String relationDefinition, String namespace) {
    this.resource = resource;
    this.relationDefinition = relationDefinition;
    this.namespace = namespace;
  }

  public String getResource() {
    return resource;
  }

  public void setResource(String resource) {
    this.resource = resource;
  }

  public String getRelationDefinition() {
    return relationDefinition;
  }

  public void setRelationDefinition(String relationDefinition) {
    this.relationDefinition = relationDefinition;
  }

  public String getNamespace() {
    return namespace;
  }

  public void setNamespace(String namespace) {
    this.namespace = namespace;
  }
}
