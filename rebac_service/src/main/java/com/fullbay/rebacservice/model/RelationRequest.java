package com.fullbay.rebacservice.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Request model for creating or deleting relation tuples. */
public class RelationRequest {

  @JsonProperty("relations")
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
