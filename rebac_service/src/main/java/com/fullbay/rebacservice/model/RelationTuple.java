package com.fullbay.rebacservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Represents a ReBAC relation tuple defining authorization relationship. */
public class RelationTuple {

  @JsonProperty("resource")
  private String resource;

  @JsonProperty("relationDefinition")
  private String relationDefinition;

  @JsonProperty("namespace")
  private String namespace;

  @JsonProperty("target")
  private String target;

  /** Default constructor for JSON deserialization. */
  public RelationTuple() {}

  /**
   * Creates a new RelationTuple.
   *
   * @param resource The resource identifier (e.g., "document:123")
   * @param relationDefinition The relation type (e.g., "owner", "viewer")
   * @param namespace The namespace for the resource
   * @param target The target/subject identifier (e.g., "user:alice@example.com")
   */
  public RelationTuple(
      String resource, String relationDefinition, String namespace, String target) {
    this.resource = resource;
    this.relationDefinition = relationDefinition;
    this.namespace = namespace;
    this.target = target;
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

  public String getTarget() {
    return target;
  }

  public void setTarget(String target) {
    this.target = target;
  }
}
