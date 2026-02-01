package com.fullbay.rebacservice;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.descope.exception.ServerCommonException;
import com.fullbay.rebacservice.model.RelationTuple;
import com.fullbay.rebacservice.service.RelationService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;

@QuarkusTest
class RelationResourceTest {

  @InjectMock RelationService relationService;

  @Test
  @DisplayName("POST /relations - valid request - should return 201")
  void createRelations_validRequest_shouldReturn201() throws Exception {
    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"relations\":[{\"resource\":\"document:123\",\"relationDefinition\":\"owner\","
                + "\"namespace\":\"documents\",\"target\":\"user:alice@example.com\"}]}")
        .when()
        .post("/relations")
        .then()
        .statusCode(201)
        .body("message", equalTo("Created 1 relation tuple(s)"));

    verify(relationService).createRelations(anyList());
  }

  @Test
  @DisplayName("POST /relations - empty relations list - should return 400")
  void createRelations_emptyList_shouldReturn400() {
    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body("{\"relations\":[]}")
        .when()
        .post("/relations")
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid request"))
        .body("message", equalTo("Relations list cannot be empty"));
  }

  @Test
  @DisplayName("POST /relations - service throws exception - should return 500")
  void createRelations_serviceException_shouldReturn500() throws Exception {
    // Arrange
    doThrow(ServerCommonException.invalidArgument("relation"))
        .when(relationService)
        .createRelations(anyList());

    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"relations\":[{\"resource\":\"document:123\",\"relationDefinition\":\"owner\","
                + "\"namespace\":\"documents\",\"target\":\"user:alice@example.com\"}]}")
        .when()
        .post("/relations")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to create relations"));
  }

  @Test
  @DisplayName("DELETE /relations - valid request - should return 204")
  void deleteRelations_validRequest_shouldReturn204() throws Exception {
    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"relations\":[{\"resource\":\"document:123\",\"relationDefinition\":\"owner\","
                + "\"namespace\":\"documents\",\"target\":\"user:alice@example.com\"}]}")
        .when()
        .delete("/relations")
        .then()
        .statusCode(204);

    verify(relationService).deleteRelations(anyList());
  }

  @Test
  @DisplayName("DELETE /relations - empty relations list - should return 400")
  void deleteRelations_emptyList_shouldReturn400() {
    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body("{\"relations\":[]}")
        .when()
        .delete("/relations")
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid request"))
        .body("message", equalTo("Relations list cannot be empty"));
  }

  @Test
  @DisplayName("DELETE /relations - service throws exception - should return 500")
  void deleteRelations_serviceException_shouldReturn500() throws Exception {
    // Arrange
    doThrow(ServerCommonException.invalidArgument("relation"))
        .when(relationService)
        .deleteRelations(anyList());

    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"relations\":[{\"resource\":\"document:123\",\"relationDefinition\":\"owner\","
                + "\"namespace\":\"documents\",\"target\":\"user:alice@example.com\"}]}")
        .when()
        .delete("/relations")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to delete relations"));
  }

  @Test
  @DisplayName("GET /relations/who-can-access - valid request - should return 200 with targets")
  void whoCanAccess_validRequest_shouldReturn200() throws Exception {
    // Arrange
    List<String> targets = Arrays.asList("user:alice@example.com", "user:bob@example.com");
    when(relationService.whoCanAccess(anyString(), anyString(), anyString())).thenReturn(targets);

    // Act & Assert
    given()
        .queryParam("resource", "document:123")
        .queryParam("relationDefinition", "viewer")
        .queryParam("namespace", "documents")
        .when()
        .get("/relations/who-can-access")
        .then()
        .statusCode(200)
        .body("targets", hasSize(2))
        .body("targets[0]", equalTo("user:alice@example.com"))
        .body("targets[1]", equalTo("user:bob@example.com"));
  }

  @Test
  @DisplayName("GET /relations/who-can-access - missing params - should return 400")
  void whoCanAccess_missingParams_shouldReturn400() {
    // Act & Assert
    given()
        .queryParam("resource", "document:123")
        .when()
        .get("/relations/who-can-access")
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid request"));
  }

  @Test
  @DisplayName("GET /relations/who-can-access - service throws exception - should return 500")
  void whoCanAccess_serviceException_shouldReturn500() throws Exception {
    // Arrange
    when(relationService.whoCanAccess(anyString(), anyString(), anyString()))
        .thenThrow(ServerCommonException.invalidArgument("resource"));

    // Act & Assert
    given()
        .queryParam("resource", "document:123")
        .queryParam("relationDefinition", "viewer")
        .queryParam("namespace", "documents")
        .when()
        .get("/relations/who-can-access")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to query who can access"));
  }

  @Test
  @DisplayName("GET /relations/resource/{resourceId} - valid request - should return 200")
  void getResourceRelations_validRequest_shouldReturn200() throws Exception {
    // Arrange
    List<RelationTuple> relations =
        Arrays.asList(
            new RelationTuple("document:123", "owner", "documents", "user:alice@example.com"),
            new RelationTuple("document:123", "viewer", "documents", "user:bob@example.com"));
    when(relationService.getResourceRelations(anyString())).thenReturn(relations);

    // Act & Assert
    given()
        .when()
        .get("/relations/resource/document:123")
        .then()
        .statusCode(200)
        .body("relations", hasSize(2))
        .body("relations[0].resource", equalTo("document:123"))
        .body("relations[0].relationDefinition", equalTo("owner"))
        .body("relations[1].relationDefinition", equalTo("viewer"));
  }

  @Test
  @DisplayName("GET /relations/resource/{resourceId} - no relations - should return empty list")
  void getResourceRelations_noRelations_shouldReturnEmptyList() throws Exception {
    // Arrange
    when(relationService.getResourceRelations(anyString())).thenReturn(Collections.emptyList());

    // Act & Assert
    given()
        .when()
        .get("/relations/resource/document:999")
        .then()
        .statusCode(200)
        .body("relations", hasSize(0));
  }

  @Test
  @DisplayName(
      "GET /relations/resource/{resourceId} - service throws exception - should return 500")
  void getResourceRelations_serviceException_shouldReturn500() throws Exception {
    // Arrange
    when(relationService.getResourceRelations(anyString()))
        .thenThrow(ServerCommonException.invalidArgument("resource"));

    // Act & Assert
    given()
        .when()
        .get("/relations/resource/document:123")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to get resource relations"));
  }

  @Test
  @DisplayName("GET /relations/target/{targetId} - valid request - should return 200")
  void getTargetAccess_validRequest_shouldReturn200() throws Exception {
    // Arrange
    List<RelationTuple> relations =
        Arrays.asList(
            new RelationTuple("document:123", "owner", "documents", "user:alice@example.com"),
            new RelationTuple("document:456", "viewer", "documents", "user:alice@example.com"));
    when(relationService.getTargetAccess(anyString())).thenReturn(relations);

    // Act & Assert
    given()
        .when()
        .get("/relations/target/user:alice@example.com")
        .then()
        .statusCode(200)
        .body("relations", hasSize(2))
        .body("relations[0].target", equalTo("user:alice@example.com"))
        .body("relations[1].target", equalTo("user:alice@example.com"))
        .body("relations[0].resource", equalTo("document:123"))
        .body("relations[1].resource", equalTo("document:456"));
  }

  @Test
  @DisplayName("GET /relations/target/{targetId} - no relations - should return empty list")
  void getTargetAccess_noRelations_shouldReturnEmptyList() throws Exception {
    // Arrange
    when(relationService.getTargetAccess(anyString())).thenReturn(Collections.emptyList());

    // Act & Assert
    given()
        .when()
        .get("/relations/target/user:nobody@example.com")
        .then()
        .statusCode(200)
        .body("relations", hasSize(0));
  }

  @Test
  @DisplayName("GET /relations/target/{targetId} - service throws exception - should return 500")
  void getTargetAccess_serviceException_shouldReturn500() throws Exception {
    // Arrange
    when(relationService.getTargetAccess(anyString()))
        .thenThrow(ServerCommonException.invalidArgument("target"));

    // Act & Assert
    given()
        .when()
        .get("/relations/target/user:alice@example.com")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to get target access"));
  }
}
