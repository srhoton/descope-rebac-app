package com.fullbay.orgservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import jakarta.inject.Inject;

import com.descope.client.DescopeClient;
import com.descope.exception.ServerCommonException;
import com.descope.model.mgmt.ManagementServices;
import com.descope.model.tenant.Tenant;
import com.descope.sdk.mgmt.TenantService;
import com.fullbay.orgservice.model.PaginatedResponse;
import com.fullbay.orgservice.model.TenantRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
class TenantServiceTest {

  @Inject com.fullbay.orgservice.service.TenantService tenantService;

  @InjectMock DescopeClient descopeClient;

  private ManagementServices managementServices;
  private TenantService mockTenantService;

  @BeforeEach
  void setUp() {
    managementServices = org.mockito.Mockito.mock(ManagementServices.class);
    mockTenantService = org.mockito.Mockito.mock(TenantService.class);
    when(descopeClient.getManagementServices()).thenReturn(managementServices);
    when(managementServices.getTenantService()).thenReturn(mockTenantService);
  }

  @Test
  @DisplayName("createTenant - valid request - should create tenant and return tenant object")
  void createTenant_validRequest_shouldCreateTenant() throws Exception {
    // Arrange
    TenantRequest request = new TenantRequest("Test Tenant");
    when(mockTenantService.create(anyString(), anyList(), anyMap())).thenReturn("tenant-123");

    // Act
    com.fullbay.orgservice.model.Tenant result = tenantService.createTenant(request);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo("tenant-123");
    assertThat(result.getName()).isEqualTo("Test Tenant");
    verify(mockTenantService).create(anyString(), anyList(), anyMap());
  }

  @Test
  @DisplayName("createTenant - descope throws exception - should propagate exception")
  void createTenant_descopeException_shouldPropagateException() throws Exception {
    // Arrange
    TenantRequest request = new TenantRequest("Test Tenant");
    when(mockTenantService.create(anyString(), anyList(), anyMap()))
        .thenThrow(ServerCommonException.invalidArgument("tenant"));

    // Act & Assert
    assertThatThrownBy(() -> tenantService.createTenant(request))
        .isInstanceOf(ServerCommonException.class);
  }

  @Test
  @DisplayName("getTenant - valid tenant id - should return tenant")
  void getTenant_validTenantId_shouldReturnTenant() throws Exception {
    // Arrange
    Tenant descopeTenant = new Tenant();
    descopeTenant.setId("tenant-123");
    descopeTenant.setName("Test Tenant");
    when(mockTenantService.load("tenant-123")).thenReturn(descopeTenant);

    // Act
    com.fullbay.orgservice.model.Tenant result = tenantService.getTenant("tenant-123");

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo("tenant-123");
    assertThat(result.getName()).isEqualTo("Test Tenant");
  }

  @Test
  @DisplayName("getTenant - tenant not found - should throw exception")
  void getTenant_tenantNotFound_shouldThrowException() throws Exception {
    // Arrange
    when(mockTenantService.load("nonexistent"))
        .thenThrow(ServerCommonException.invalidArgument("tenant"));

    // Act & Assert
    assertThatThrownBy(() -> tenantService.getTenant("nonexistent"))
        .isInstanceOf(ServerCommonException.class);
  }

  @Test
  @DisplayName("updateTenant - valid request - should update and return tenant")
  void updateTenant_validRequest_shouldUpdateTenant() throws Exception {
    // Arrange
    TenantRequest request = new TenantRequest("Updated Tenant");

    // Act
    com.fullbay.orgservice.model.Tenant result = tenantService.updateTenant("tenant-123", request);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo("tenant-123");
    assertThat(result.getName()).isEqualTo("Updated Tenant");
    verify(mockTenantService).update(eq("tenant-123"), anyString(), anyList(), anyMap());
  }

  @Test
  @DisplayName("deleteTenant - valid tenant id - should delete tenant")
  void deleteTenant_validTenantId_shouldDeleteTenant() throws Exception {
    // Act
    tenantService.deleteTenant("tenant-123");

    // Assert
    verify(mockTenantService).delete("tenant-123");
  }

  @Test
  @DisplayName("getAllTenants - with tenants - should return paginated response")
  void getAllTenants_withTenants_shouldReturnPaginatedResponse() throws Exception {
    // Arrange
    Tenant tenant1 = new Tenant();
    tenant1.setId("tenant-1");
    tenant1.setName("Tenant 1");

    Tenant tenant2 = new Tenant();
    tenant2.setId("tenant-2");
    tenant2.setName("Tenant 2");

    Tenant tenant3 = new Tenant();
    tenant3.setId("tenant-3");
    tenant3.setName("Tenant 3");

    List<Tenant> allTenants = Arrays.asList(tenant1, tenant2, tenant3);
    when(mockTenantService.loadAll()).thenReturn(allTenants);

    // Act
    PaginatedResponse<com.fullbay.orgservice.model.Tenant> result =
        tenantService.getAllTenants(0, 2);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getItems()).hasSize(2);
    assertThat(result.getPage()).isEqualTo(0);
    assertThat(result.getPageSize()).isEqualTo(2);
    assertThat(result.getTotalItems()).isEqualTo(3);
    assertThat(result.getTotalPages()).isEqualTo(2);
    assertThat(result.getItems().get(0).getId()).isEqualTo("tenant-1");
    assertThat(result.getItems().get(1).getId()).isEqualTo("tenant-2");
  }

  @Test
  @DisplayName("getAllTenants - empty list - should return empty paginated response")
  void getAllTenants_emptyList_shouldReturnEmptyPaginatedResponse() throws Exception {
    // Arrange
    when(mockTenantService.loadAll()).thenReturn(Collections.emptyList());

    // Act
    PaginatedResponse<com.fullbay.orgservice.model.Tenant> result =
        tenantService.getAllTenants(0, 10);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getItems()).isEmpty();
    assertThat(result.getTotalItems()).isEqualTo(0);
    assertThat(result.getTotalPages()).isEqualTo(0);
  }

  @Test
  @DisplayName("getAllTenants - page beyond available - should return empty items")
  void getAllTenants_pageBeyondAvailable_shouldReturnEmptyItems() throws Exception {
    // Arrange
    Tenant tenant1 = new Tenant();
    tenant1.setId("tenant-1");
    tenant1.setName("Tenant 1");

    when(mockTenantService.loadAll()).thenReturn(Collections.singletonList(tenant1));

    // Act
    PaginatedResponse<com.fullbay.orgservice.model.Tenant> result =
        tenantService.getAllTenants(5, 10);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getItems()).isEmpty();
    assertThat(result.getTotalItems()).isEqualTo(1);
  }
}
