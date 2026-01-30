package com.fullbay.orgservice;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;

import com.descope.exception.ServerCommonException;
import com.fullbay.orgservice.model.PaginatedResponse;
import com.fullbay.orgservice.model.Tenant;
import com.fullbay.orgservice.model.TenantRequest;
import com.fullbay.orgservice.service.TenantService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;

@QuarkusTest
class TenantResourceTest {

  @InjectMock TenantService tenantService;

  @Test
  @DisplayName("POST /tenants - valid request - should return 201 with created tenant")
  void createTenant_validRequest_shouldReturn201() throws Exception {
    // Arrange
    Tenant tenant = new Tenant("tenant-123", "Test Tenant");
    when(tenantService.createTenant(any(TenantRequest.class))).thenReturn(tenant);

    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body("{\"name\":\"Test Tenant\"}")
        .when()
        .post("/tenants")
        .then()
        .statusCode(201)
        .body("id", equalTo("tenant-123"))
        .body("name", equalTo("Test Tenant"));
  }

  @Test
  @DisplayName("POST /tenants - service throws exception - should return 500")
  void createTenant_serviceException_shouldReturn500() throws Exception {
    // Arrange
    when(tenantService.createTenant(any(TenantRequest.class)))
        .thenThrow(ServerCommonException.invalidArgument("tenant"));

    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body("{\"name\":\"Test Tenant\"}")
        .when()
        .post("/tenants")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to create tenant"));
  }

  @Test
  @DisplayName("GET /tenants/{tenantId} - valid id - should return 200 with tenant")
  void getTenant_validId_shouldReturn200() throws Exception {
    // Arrange
    Tenant tenant = new Tenant("tenant-123", "Test Tenant");
    when(tenantService.getTenant("tenant-123")).thenReturn(tenant);

    // Act & Assert
    given()
        .when()
        .get("/tenants/tenant-123")
        .then()
        .statusCode(200)
        .body("id", equalTo("tenant-123"))
        .body("name", equalTo("Test Tenant"));
  }

  @Test
  @DisplayName("GET /tenants/{tenantId} - tenant not found - should return 404")
  void getTenant_notFound_shouldReturn404() throws Exception {
    // Arrange
    when(tenantService.getTenant("nonexistent"))
        .thenThrow(ServerCommonException.invalidArgument("Tenant not found"));

    // Act & Assert
    given().when().get("/tenants/nonexistent").then().statusCode(404);
  }

  @Test
  @DisplayName("GET /tenants - with tenants - should return 200 with paginated response")
  void getAllTenants_withTenants_shouldReturn200() throws Exception {
    // Arrange
    Tenant tenant1 = new Tenant("tenant-1", "Tenant 1");
    Tenant tenant2 = new Tenant("tenant-2", "Tenant 2");
    PaginatedResponse<Tenant> response =
        new PaginatedResponse<>(Arrays.asList(tenant1, tenant2), 0, 20, 2);

    when(tenantService.getAllTenants(0, 20)).thenReturn(response);

    // Act & Assert
    given()
        .when()
        .get("/tenants")
        .then()
        .statusCode(200)
        .body("items", hasSize(2))
        .body("page", is(0))
        .body("pageSize", is(20))
        .body("totalItems", is(2))
        .body("totalPages", is(1))
        .body("items[0].id", equalTo("tenant-1"))
        .body("items[1].id", equalTo("tenant-2"));
  }

  @Test
  @DisplayName("GET /tenants - with pagination params - should use provided params")
  void getAllTenants_withPaginationParams_shouldUseParams() throws Exception {
    // Arrange
    PaginatedResponse<Tenant> response = new PaginatedResponse<>(Collections.emptyList(), 2, 10, 0);

    when(tenantService.getAllTenants(2, 10)).thenReturn(response);

    // Act & Assert
    given()
        .queryParam("page", 2)
        .queryParam("pageSize", 10)
        .when()
        .get("/tenants")
        .then()
        .statusCode(200)
        .body("page", is(2))
        .body("pageSize", is(10));

    verify(tenantService).getAllTenants(2, 10);
  }

  @Test
  @DisplayName("PUT /tenants/{tenantId} - valid request - should return 200 with updated tenant")
  void updateTenant_validRequest_shouldReturn200() throws Exception {
    // Arrange
    Tenant tenant = new Tenant("tenant-123", "Updated Tenant");
    when(tenantService.updateTenant(eq("tenant-123"), any(TenantRequest.class))).thenReturn(tenant);

    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body("{\"name\":\"Updated Tenant\"}")
        .when()
        .put("/tenants/tenant-123")
        .then()
        .statusCode(200)
        .body("id", equalTo("tenant-123"))
        .body("name", equalTo("Updated Tenant"));
  }

  @Test
  @DisplayName("PUT /tenants/{tenantId} - service throws exception - should return 500")
  void updateTenant_serviceException_shouldReturn500() throws Exception {
    // Arrange
    when(tenantService.updateTenant(eq("tenant-123"), any(TenantRequest.class)))
        .thenThrow(ServerCommonException.invalidArgument("tenant"));

    // Act & Assert
    given()
        .contentType(ContentType.JSON)
        .body("{\"name\":\"Updated Tenant\"}")
        .when()
        .put("/tenants/tenant-123")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to update tenant"));
  }

  @Test
  @DisplayName("DELETE /tenants/{tenantId} - valid id - should return 204")
  void deleteTenant_validId_shouldReturn204() throws Exception {
    // Act & Assert
    given().when().delete("/tenants/tenant-123").then().statusCode(204);

    verify(tenantService).deleteTenant("tenant-123");
  }

  @Test
  @DisplayName("DELETE /tenants/{tenantId} - service throws exception - should return 500")
  void deleteTenant_serviceException_shouldReturn500() throws Exception {
    // Arrange
    doThrow(ServerCommonException.invalidArgument("tenant"))
        .when(tenantService)
        .deleteTenant("tenant-123");

    // Act & Assert
    given()
        .when()
        .delete("/tenants/tenant-123")
        .then()
        .statusCode(500)
        .body("error", equalTo("Failed to delete tenant"));
  }
}
