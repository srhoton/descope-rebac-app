package com.fullbay.rebacservice.service;

import java.util.ArrayList;
import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import com.descope.client.DescopeClient;
import com.descope.exception.DescopeException;
import com.descope.model.authz.Relation;
import com.descope.sdk.mgmt.AuthzService;
import com.fullbay.rebacservice.model.RelationTuple;

import io.quarkus.logging.Log;

/** Service for managing Descope FGA relation tuples. */
@ApplicationScoped
public class RelationService {

  @Inject DescopeClient descopeClient;

  /**
   * Converts a list of RelationTuples to Descope Relation objects.
   *
   * @param tuples The list of relation tuples to convert
   * @return List of Descope Relation objects
   */
  private List<Relation> convertTuplesToRelations(List<RelationTuple> tuples) {
    List<Relation> relations = new ArrayList<>();
    for (RelationTuple tuple : tuples) {
      Relation relation = new Relation();
      relation.setResource(tuple.getResource());
      relation.setRelationDefinition(tuple.getRelationDefinition());
      relation.setNamespace(tuple.getNamespace());
      relation.setTarget(tuple.getTarget());
      relations.add(relation);
    }
    return relations;
  }

  /**
   * Converts a list of Descope Relation objects to RelationTuples.
   *
   * @param relations The list of Descope Relation objects to convert
   * @return List of RelationTuple objects
   */
  private List<RelationTuple> convertRelationsToTuples(List<Relation> relations) {
    List<RelationTuple> tuples = new ArrayList<>();
    for (Relation relation : relations) {
      tuples.add(
          new RelationTuple(
              relation.getResource(),
              relation.getRelationDefinition(),
              relation.getNamespace(),
              relation.getTarget()));
    }
    return tuples;
  }

  /**
   * Creates one or more FGA relation tuples.
   *
   * @param tuples The list of relation tuples to create
   * @throws DescopeException if the operation fails
   */
  public void createRelations(List<RelationTuple> tuples) throws DescopeException {
    Log.infof("Creating %d relation tuple(s)", tuples.size());

    AuthzService authzService = descopeClient.getManagementServices().getAuthzService();
    List<Relation> relations = convertTuplesToRelations(tuples);

    authzService.createRelations(relations);
    Log.infof("Successfully created %d relation tuple(s)", tuples.size());
  }

  /**
   * Deletes one or more FGA relation tuples.
   *
   * @param tuples The list of relation tuples to delete
   * @throws DescopeException if the operation fails
   */
  public void deleteRelations(List<RelationTuple> tuples) throws DescopeException {
    Log.infof("Deleting %d relation tuple(s)", tuples.size());

    AuthzService authzService = descopeClient.getManagementServices().getAuthzService();
    List<Relation> relations = convertTuplesToRelations(tuples);

    authzService.deleteRelations(relations);
    Log.infof("Successfully deleted %d relation tuple(s)", tuples.size());
  }

  /**
   * Queries who can access a specific resource with a given relation.
   *
   * @param resource The resource identifier
   * @param relationDefinition The relation type
   * @param namespace The namespace
   * @return List of targets that can access the resource
   * @throws DescopeException if the operation fails
   */
  public List<String> whoCanAccess(String resource, String relationDefinition, String namespace)
      throws DescopeException {
    Log.infof(
        "Querying who can access resource: %s with relation: %s in namespace: %s",
        resource, relationDefinition, namespace);

    AuthzService authzService = descopeClient.getManagementServices().getAuthzService();
    List<String> targets = authzService.whoCanAccess(resource, relationDefinition, namespace);

    Log.infof("Found %d target(s) that can access the resource", targets.size());
    return targets;
  }

  /**
   * Gets all relations for a specific resource.
   *
   * @param resourceId The resource identifier
   * @return List of relation tuples for the resource
   * @throws DescopeException if the operation fails
   */
  public List<RelationTuple> getResourceRelations(String resourceId) throws DescopeException {
    Log.infof("Getting relations for resource: %s", resourceId);

    AuthzService authzService = descopeClient.getManagementServices().getAuthzService();
    List<Relation> relations = authzService.resourceRelations(resourceId);
    List<RelationTuple> tuples = convertRelationsToTuples(relations);

    Log.infof("Found %d relation(s) for resource", tuples.size());
    return tuples;
  }

  /**
   * Queries what resources a target can access.
   *
   * @param targetId The target/subject identifier
   * @return List of relation tuples showing what the target can access
   * @throws DescopeException if the operation fails
   */
  public List<RelationTuple> getTargetAccess(String targetId) throws DescopeException {
    Log.infof("Getting access for target: %s", targetId);

    AuthzService authzService = descopeClient.getManagementServices().getAuthzService();
    List<Relation> relations = authzService.whatCanTargetAccess(targetId);
    List<RelationTuple> tuples = convertRelationsToTuples(relations);

    Log.infof("Found %d relation(s) for target", tuples.size());
    return tuples;
  }
}
