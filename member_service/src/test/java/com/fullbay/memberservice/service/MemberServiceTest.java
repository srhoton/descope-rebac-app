package com.fullbay.memberservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import jakarta.inject.Inject;

import com.descope.client.DescopeClient;
import com.descope.exception.ServerCommonException;
import com.descope.model.auth.AssociatedTenant;
import com.descope.model.mgmt.ManagementServices;
import com.descope.model.user.request.UserRequest;
import com.descope.model.user.request.UserSearchRequest;
import com.descope.model.user.response.AllUsersResponseDetails;
import com.descope.model.user.response.UserResponse;
import com.descope.model.user.response.UserResponseDetails;
import com.descope.sdk.mgmt.UserService;
import com.fullbay.memberservice.model.Member;
import com.fullbay.memberservice.model.MemberRequest;
import com.fullbay.memberservice.model.PaginatedResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
class MemberServiceTest {

  @Inject MemberService memberService;

  @InjectMock DescopeClient descopeClient;

  private ManagementServices managementServices;
  private UserService mockUserService;

  @BeforeEach
  void setUp() {
    managementServices = mock(ManagementServices.class);
    mockUserService = mock(UserService.class);
    when(descopeClient.getManagementServices()).thenReturn(managementServices);
    when(managementServices.getUserService()).thenReturn(mockUserService);
  }

  @Test
  @DisplayName("createMember - valid request - should create member successfully")
  void createMember_validRequest_shouldCreateMemberSuccessfully() throws Exception {
    // Given
    String tenantId = "tenant123";
    MemberRequest request =
        new MemberRequest("user@example.com", "John Doe", "user@example.com", "+1234567890");

    UserResponseDetails mockResponse = mock(UserResponseDetails.class);
    when(mockUserService.create(anyString(), any(UserRequest.class))).thenReturn(mockResponse);

    // When
    Member result = memberService.createMember(tenantId, request);

    // Then
    assertThat(result).isNotNull();
    assertThat(result.getLoginId()).isEqualTo("user@example.com");
    assertThat(result.getName()).isEqualTo("John Doe");
    assertThat(result.getTenantId()).isEqualTo(tenantId);
    verify(mockUserService).create(eq("user@example.com"), any(UserRequest.class));
  }

  @Test
  @DisplayName("createMember - descope throws exception - should propagate exception")
  void createMember_descopeException_shouldPropagateException() throws Exception {
    // Given
    String tenantId = "tenant123";
    MemberRequest request =
        new MemberRequest("user@example.com", "John Doe", "user@example.com", "+1234567890");
    when(mockUserService.create(anyString(), any(UserRequest.class)))
        .thenThrow(ServerCommonException.invalidArgument("user"));

    // When/Then
    assertThatThrownBy(() -> memberService.createMember(tenantId, request))
        .isInstanceOf(ServerCommonException.class);
  }

  @Test
  @DisplayName("getMember - valid loginId - should return member")
  void getMember_validLoginId_shouldReturnMember() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";

    UserResponse mockUser = mock(UserResponse.class);
    when(mockUser.getLoginIds()).thenReturn(Collections.singletonList(loginId));
    when(mockUser.getName()).thenReturn("John Doe");
    when(mockUser.getEmail()).thenReturn("user@example.com");
    when(mockUser.getPhone()).thenReturn("+1234567890");

    AssociatedTenant userTenant = new AssociatedTenant();
    userTenant.setTenantId(tenantId);
    when(mockUser.getUserTenants()).thenReturn(Collections.singletonList(userTenant));

    UserResponseDetails mockDetails = mock(UserResponseDetails.class);
    when(mockDetails.getUser()).thenReturn(mockUser);
    when(mockUserService.load(loginId)).thenReturn(mockDetails);

    // When
    Member result = memberService.getMember(tenantId, loginId);

    // Then
    assertThat(result).isNotNull();
    assertThat(result.getLoginId()).isEqualTo(loginId);
    assertThat(result.getName()).isEqualTo("John Doe");
    assertThat(result.getTenantId()).isEqualTo(tenantId);
  }

  @Test
  @DisplayName("getMember - user not in tenant - should throw exception")
  void getMember_userNotInTenant_shouldThrowException() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";

    UserResponse mockUser = mock(UserResponse.class);
    when(mockUser.getLoginIds()).thenReturn(Collections.singletonList(loginId));
    when(mockUser.getUserTenants()).thenReturn(Collections.emptyList());

    UserResponseDetails mockDetails = mock(UserResponseDetails.class);
    when(mockDetails.getUser()).thenReturn(mockUser);
    when(mockUserService.load(loginId)).thenReturn(mockDetails);

    // When/Then
    assertThatThrownBy(() -> memberService.getMember(tenantId, loginId))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("not found in tenant");
  }

  @Test
  @DisplayName("updateMember - valid request - should update member successfully")
  void updateMember_validRequest_shouldUpdateMemberSuccessfully() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";
    MemberRequest request =
        new MemberRequest(loginId, "Jane Doe", "jane@example.com", "+0987654321");

    // Setup for getMember call (validation)
    UserResponse mockUser = mock(UserResponse.class);
    when(mockUser.getLoginIds()).thenReturn(Collections.singletonList(loginId));
    when(mockUser.getName()).thenReturn("John Doe");
    when(mockUser.getEmail()).thenReturn("user@example.com");

    AssociatedTenant userTenant = new AssociatedTenant();
    userTenant.setTenantId(tenantId);
    when(mockUser.getUserTenants()).thenReturn(Collections.singletonList(userTenant));

    UserResponseDetails mockDetails = mock(UserResponseDetails.class);
    when(mockDetails.getUser()).thenReturn(mockUser);
    when(mockUserService.load(loginId)).thenReturn(mockDetails);

    UserResponseDetails updateResponse = mock(UserResponseDetails.class);
    when(mockUserService.update(anyString(), any(UserRequest.class))).thenReturn(updateResponse);

    // When
    Member result = memberService.updateMember(tenantId, loginId, request);

    // Then
    assertThat(result).isNotNull();
    assertThat(result.getLoginId()).isEqualTo(loginId);
    assertThat(result.getName()).isEqualTo("Jane Doe");
    verify(mockUserService).update(eq(loginId), any(UserRequest.class));
  }

  @Test
  @DisplayName("deleteMember - valid loginId - should delete member successfully")
  void deleteMember_validLoginId_shouldDeleteMemberSuccessfully() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";

    UserResponse mockUser = mock(UserResponse.class);
    when(mockUser.getLoginIds()).thenReturn(Collections.singletonList(loginId));

    AssociatedTenant userTenant = new AssociatedTenant();
    userTenant.setTenantId(tenantId);
    when(mockUser.getUserTenants()).thenReturn(Collections.singletonList(userTenant));

    UserResponseDetails mockDetails = mock(UserResponseDetails.class);
    when(mockDetails.getUser()).thenReturn(mockUser);
    when(mockUserService.load(loginId)).thenReturn(mockDetails);

    // When
    memberService.deleteMember(tenantId, loginId);

    // Then
    verify(mockUserService).delete(loginId);
  }

  @Test
  @DisplayName("getAllMembers - valid tenant - should return paginated members")
  void getAllMembers_validTenant_shouldReturnPaginatedMembers() throws Exception {
    // Given
    String tenantId = "tenant123";

    UserResponse mockUser1 = mock(UserResponse.class);
    when(mockUser1.getLoginIds()).thenReturn(Collections.singletonList("user1@example.com"));
    when(mockUser1.getName()).thenReturn("User One");
    when(mockUser1.getEmail()).thenReturn("user1@example.com");

    UserResponse mockUser2 = mock(UserResponse.class);
    when(mockUser2.getLoginIds()).thenReturn(Collections.singletonList("user2@example.com"));
    when(mockUser2.getName()).thenReturn("User Two");
    when(mockUser2.getEmail()).thenReturn("user2@example.com");

    List<UserResponse> users = Arrays.asList(mockUser1, mockUser2);

    AllUsersResponseDetails mockResponse = mock(AllUsersResponseDetails.class);
    when(mockResponse.getUsers()).thenReturn(users);
    when(mockUserService.searchAll(any(UserSearchRequest.class))).thenReturn(mockResponse);

    // When
    PaginatedResponse<Member> result = memberService.getAllMembers(tenantId, 0, 20);

    // Then
    assertThat(result).isNotNull();
    assertThat(result.getItems()).hasSize(2);
    assertThat(result.getTotalItems()).isEqualTo(2);
    assertThat(result.getPage()).isEqualTo(0);
  }

  @Test
  @DisplayName("getAllMembers - empty result - should return empty list")
  void getAllMembers_emptyResult_shouldReturnEmptyList() throws Exception {
    // Given
    String tenantId = "tenant123";

    AllUsersResponseDetails mockResponse = mock(AllUsersResponseDetails.class);
    when(mockResponse.getUsers()).thenReturn(Collections.emptyList());
    when(mockUserService.searchAll(any(UserSearchRequest.class))).thenReturn(mockResponse);

    // When
    PaginatedResponse<Member> result = memberService.getAllMembers(tenantId, 0, 20);

    // Then
    assertThat(result).isNotNull();
    assertThat(result.getItems()).isEmpty();
    assertThat(result.getTotalItems()).isEqualTo(0);
  }
}
