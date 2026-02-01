package com.fullbay.rebacservice.model;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonProperty;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/** Request model for creating or deleting relation tuples. */
@Schema(description = "Request payload for creating or deleting relation tuples")
public class RelationRequest {

  @JsonProperty("relations")
  @NotEmpty(message = "Relations list cannot be empty")
  @Valid
  @Schema(description = "List of relation tuples to create or delete", required = true)
  private List<RelationTuple> relations;

  /** Default constructor for JSON deserialization. */
  public RelationRequest() {}

  /**
   * Creates a new RelationRequest.
   *
   * @param relations The list of relation tuples
   */
  public RelationRequest(List<RelationTuple> relations) {
    this.relations = relations;
  }

  public List<RelationTuple> getRelations() {
    return relations;
  }

  public void setRelations(List<RelationTuple> relations) {
    this.relations = relations;
  }
}
