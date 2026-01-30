package com.fullbay.rebacservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/** Represents a ReBAC relation tuple defining authorization relationship. */
@Schema(description = "Authorization relation tuple defining a subject's access to a resource")
public class RelationTuple {

  @JsonProperty("resource")
  @Schema(description = "Resource identifier", required = true, example = "document:123")
  private String resource;

  @JsonProperty("relationDefinition")
  @Schema(description = "Relation type/definition", required = true, example = "viewer")
  private String relationDefinition;

  @JsonProperty("namespace")
  @Schema(description = "Namespace for the resource", required = true, example = "documents")
  private String namespace;

  @JsonProperty("target")
  @Schema(
      description = "Target/subject identifier",
      required = true,
      example = "user:alice@example.com")
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
