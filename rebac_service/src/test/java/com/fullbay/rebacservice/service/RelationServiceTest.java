package com.fullbay.rebacservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import jakarta.inject.Inject;

import com.descope.client.DescopeClient;
import com.descope.exception.ServerCommonException;
import com.descope.model.authz.Relation;
import com.descope.model.mgmt.ManagementServices;
import com.descope.sdk.mgmt.AuthzService;
import com.fullbay.rebacservice.config.MockDescopeClientProducer;
import com.fullbay.rebacservice.model.RelationTuple;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
class RelationServiceTest {

  @Inject RelationService relationService;

  private final DescopeClient descopeClient = MockDescopeClientProducer.getMockClient();
  private ManagementServices managementServices;
  private AuthzService mockAuthzService;

  @BeforeEach
  void setUp() {
    reset(descopeClient);
    managementServices = org.mockito.Mockito.mock(ManagementServices.class);
    mockAuthzService = org.mockito.Mockito.mock(AuthzService.class);
    when(descopeClient.getManagementServices()).thenReturn(managementServices);
    when(managementServices.getAuthzService()).thenReturn(mockAuthzService);
  }

  @Test
  @DisplayName("createRelations - valid request - should create relations successfully")
  void createRelations_validRequest_shouldCreateRelations() throws Exception {
    // Arrange
    List<RelationTuple> tuples =
        Arrays.asList(
            new RelationTuple("document:123", "owner", "documents", "user:alice@example.com"),
            new RelationTuple("document:123", "viewer", "documents", "user:bob@example.com"));

    // Act
    relationService.createRelations(tuples);

    // Assert
    verify(mockAuthzService).createRelations(anyList());
  }

  @Test
  @DisplayName("createRelations - descope throws exception - should propagate exception")
  void createRelations_descopeException_shouldPropagateException() throws Exception {
    // Arrange
    List<RelationTuple> tuples =
        Collections.singletonList(
            new RelationTuple("document:123", "owner", "documents", "user:alice@example.com"));
    org.mockito.Mockito.doThrow(ServerCommonException.invalidArgument("relation"))
        .when(mockAuthzService)
        .createRelations(anyList());

    // Act & Assert
    assertThatThrownBy(() -> relationService.createRelations(tuples))
        .isInstanceOf(ServerCommonException.class);
  }

  @Test
  @DisplayName("deleteRelations - valid request - should delete relations successfully")
  void deleteRelations_validRequest_shouldDeleteRelations() throws Exception {
    // Arrange
    List<RelationTuple> tuples =
        Collections.singletonList(
            new RelationTuple("document:123", "owner", "documents", "user:alice@example.com"));

    // Act
    relationService.deleteRelations(tuples);

    // Assert
    verify(mockAuthzService).deleteRelations(anyList());
  }

  @Test
  @DisplayName("whoCanAccess - valid request - should return list of targets")
  void whoCanAccess_validRequest_shouldReturnTargets() throws Exception {
    // Arrange
    List<String> expectedTargets = Arrays.asList("user:alice@example.com", "user:bob@example.com");
    when(mockAuthzService.whoCanAccess(anyString(), anyString(), anyString()))
        .thenReturn(expectedTargets);

    // Act
    List<String> result = relationService.whoCanAccess("document:123", "viewer", "documents");

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
    assertThat(result).containsExactlyInAnyOrderElementsOf(expectedTargets);
  }

  @Test
  @DisplayName("whoCanAccess - no targets found - should return empty list")
  void whoCanAccess_noTargets_shouldReturnEmptyList() throws Exception {
    // Arrange
    when(mockAuthzService.whoCanAccess(anyString(), anyString(), anyString()))
        .thenReturn(Collections.emptyList());

    // Act
    List<String> result = relationService.whoCanAccess("document:123", "viewer", "documents");

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("getResourceRelations - valid resource - should return relations")
  void getResourceRelations_validResource_shouldReturnRelations() throws Exception {
    // Arrange
    Relation relation1 = new Relation();
    relation1.setResource("document:123");
    relation1.setRelationDefinition("owner");
    relation1.setNamespace("documents");
    relation1.setTarget("user:alice@example.com");

    Relation relation2 = new Relation();
    relation2.setResource("document:123");
    relation2.setRelationDefinition("viewer");
    relation2.setNamespace("documents");
    relation2.setTarget("user:bob@example.com");

    when(mockAuthzService.resourceRelations(anyString()))
        .thenReturn(Arrays.asList(relation1, relation2));

    // Act
    List<RelationTuple> result = relationService.getResourceRelations("document:123");

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
    assertThat(result.get(0).getResource()).isEqualTo("document:123");
    assertThat(result.get(0).getRelationDefinition()).isEqualTo("owner");
    assertThat(result.get(1).getRelationDefinition()).isEqualTo("viewer");
  }

  @Test
  @DisplayName("getResourceRelations - no relations found - should return empty list")
  void getResourceRelations_noRelations_shouldReturnEmptyList() throws Exception {
    // Arrange
    when(mockAuthzService.resourceRelations(anyString())).thenReturn(Collections.emptyList());

    // Act
    List<RelationTuple> result = relationService.getResourceRelations("document:999");

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("getTargetAccess - valid target - should return relations")
  void getTargetAccess_validTarget_shouldReturnRelations() throws Exception {
    // Arrange
    Relation relation1 = new Relation();
    relation1.setResource("document:123");
    relation1.setRelationDefinition("owner");
    relation1.setNamespace("documents");
    relation1.setTarget("user:alice@example.com");

    Relation relation2 = new Relation();
    relation2.setResource("document:456");
    relation2.setRelationDefinition("viewer");
    relation2.setNamespace("documents");
    relation2.setTarget("user:alice@example.com");

    when(mockAuthzService.whatCanTargetAccess(anyString()))
        .thenReturn(Arrays.asList(relation1, relation2));

    // Act
    List<RelationTuple> result = relationService.getTargetAccess("user:alice@example.com");

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
    assertThat(result.get(0).getTarget()).isEqualTo("user:alice@example.com");
    assertThat(result.get(1).getTarget()).isEqualTo("user:alice@example.com");
    assertThat(result.get(0).getResource()).isEqualTo("document:123");
    assertThat(result.get(1).getResource()).isEqualTo("document:456");
  }

  @Test
  @DisplayName("getTargetAccess - no relations found - should return empty list")
  void getTargetAccess_noRelations_shouldReturnEmptyList() throws Exception {
    // Arrange
    when(mockAuthzService.whatCanTargetAccess(anyString())).thenReturn(Collections.emptyList());

    // Act
    List<RelationTuple> result = relationService.getTargetAccess("user:nobody@example.com");

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).isEmpty();
  }
}
