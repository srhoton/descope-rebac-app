package com.fullbay.memberservice.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import com.descope.client.DescopeClient;
import com.descope.exception.DescopeException;
import com.descope.model.auth.AssociatedTenant;
import com.descope.model.user.request.UserRequest;
import com.descope.model.user.request.UserSearchRequest;
import com.descope.model.user.response.AllUsersResponseDetails;
import com.descope.model.user.response.UserResponse;
import com.descope.model.user.response.UserResponseDetails;
import com.fullbay.memberservice.exception.MemberNotFoundException;
import com.fullbay.memberservice.model.Member;
import com.fullbay.memberservice.model.MemberRequest;
import com.fullbay.memberservice.model.PaginatedResponse;
import com.fullbay.memberservice.model.UserInfo;

import io.quarkus.logging.Log;

/** Service class for managing Descope members within tenants. */
@ApplicationScoped
public class MemberService {

  @Inject DescopeClient descopeClient;

  /**
   * Creates a new member in the specified tenant.
   *
   * @param tenantId The tenant ID where the member will be created
   * @param request The member creation request
   * @return The created member
   * @throws DescopeException If the member creation fails
   */
  public Member createMember(String tenantId, MemberRequest request) throws DescopeException {
    Log.infof("Creating member with loginId: %s in tenant: %s", request.getLoginId(), tenantId);

    // Create UserRequest for Descope SDK
    UserRequest userRequest = new UserRequest();
    userRequest.setEmail(request.getEmail());
    userRequest.setPhone(request.getPhone());
    userRequest.setDisplayName(request.getName());

    // Create AssociatedTenant for tenant association
    AssociatedTenant tenant = new AssociatedTenant();
    tenant.setTenantId(tenantId);
    userRequest.setUserTenants(Collections.singletonList(tenant));

    descopeClient
        .getManagementServices()
        .getUserService()
        .create(request.getLoginId(), userRequest);

    Log.infof("Member created successfully: %s in tenant: %s", request.getLoginId(), tenantId);

    return new Member(
        request.getLoginId(), request.getName(), request.getEmail(), request.getPhone(), tenantId);
  }

  /**
   * Retrieves a member by login ID from the specified tenant.
   *
   * @param tenantId The tenant ID
   * @param loginId The member's login ID
   * @return The member
   * @throws DescopeException If the member is not found or retrieval fails
   */
  public Member getMember(String tenantId, String loginId) throws DescopeException {
    Log.infof("Retrieving member with loginId: %s from tenant: %s", loginId, tenantId);

    UserResponseDetails userDetails =
        descopeClient.getManagementServices().getUserService().load(loginId);
    UserResponse user = userDetails.getUser();

    // Log tenant associations for debugging
    if (user.getUserTenants() == null) {
      Log.warnf("User %s has null tenant associations", loginId);
    } else {
      Log.infof(
          "User %s has %d tenant associations: %s",
          loginId,
          user.getUserTenants().size(),
          user.getUserTenants().stream()
              .map(t -> t.getTenantId())
              .collect(Collectors.joining(", ")));
    }

    // Verify the user belongs to the specified tenant
    if (user.getUserTenants() == null
        || user.getUserTenants().stream()
            .noneMatch(tenant -> tenant.getTenantId().equals(tenantId))) {
      throw new MemberNotFoundException(tenantId, loginId);
    }

    return new Member(
        user.getLoginIds().get(0), user.getName(), user.getEmail(), user.getPhone(), tenantId);
  }

  /**
   * Updates an existing member in the specified tenant.
   *
   * @param tenantId The tenant ID
   * @param loginId The member's login ID
   * @param request The member update request
   * @return The updated member
   * @throws DescopeException If the member update fails
   */
  public Member updateMember(String tenantId, String loginId, MemberRequest request)
      throws DescopeException {
    Log.infof("Updating member %s in tenant: %s", loginId, tenantId);

    // First verify the member exists and belongs to the tenant
    Member existingMember = getMember(tenantId, loginId);

    // Create UserRequest for update - preserve tenant association
    UserRequest userRequest = new UserRequest();
    userRequest.setEmail(request.getEmail());
    userRequest.setPhone(request.getPhone());
    userRequest.setDisplayName(request.getName());

    // Preserve the tenant association during update
    AssociatedTenant tenant = new AssociatedTenant();
    tenant.setTenantId(tenantId);
    userRequest.setUserTenants(Collections.singletonList(tenant));

    descopeClient.getManagementServices().getUserService().update(loginId, userRequest);

    Log.infof("Member %s updated successfully in tenant: %s", loginId, tenantId);

    return new Member(loginId, request.getName(), request.getEmail(), request.getPhone(), tenantId);
  }

  /**
   * Deletes a member from the specified tenant.
   *
   * @param tenantId The tenant ID
   * @param loginId The member's login ID
   * @throws DescopeException If the member deletion fails
   */
  public void deleteMember(String tenantId, String loginId) throws DescopeException {
    Log.infof("Deleting member %s from tenant: %s", loginId, tenantId);

    // First verify the member exists and belongs to the tenant
    getMember(tenantId, loginId);

    // Delete the user
    descopeClient.getManagementServices().getUserService().delete(loginId);

    Log.infof("Member %s deleted successfully from tenant: %s", loginId, tenantId);
  }

  /**
   * Retrieves all members in a tenant with pagination support.
   *
   * @param tenantId The tenant ID
   * @param page The page number (0-indexed)
   * @param pageSize The number of items per page
   * @return A paginated response containing members
   * @throws DescopeException If member retrieval fails
   */
  public PaginatedResponse<Member> getAllMembers(String tenantId, int page, int pageSize)
      throws DescopeException {
    Log.infof(
        "Retrieving all members for tenant: %s - page: %d, pageSize: %d", tenantId, page, pageSize);

    // Search for users by tenant ID
    UserSearchRequest searchRequest = new UserSearchRequest();
    searchRequest.setTenantIds(Collections.singletonList(tenantId));

    AllUsersResponseDetails usersResponse =
        descopeClient.getManagementServices().getUserService().searchAll(searchRequest);

    List<UserResponse> allUsers = usersResponse.getUsers();
    if (allUsers == null) {
      allUsers = Collections.emptyList();
    }

    long totalItems = allUsers.size();
    int startIndex = page * pageSize;
    int endIndex = Math.min(startIndex + pageSize, allUsers.size());

    List<Member> paginatedMembers;
    if (startIndex >= allUsers.size()) {
      paginatedMembers = Collections.emptyList();
    } else {
      paginatedMembers =
          allUsers.subList(startIndex, endIndex).stream()
              .map(
                  user ->
                      new Member(
                          user.getUserId(),
                          user.getName(),
                          user.getEmail(),
                          user.getPhone(),
                          tenantId))
              .collect(Collectors.toList());
    }

    Log.infof(
        "Retrieved %d members out of %d total for tenant: %s",
        paginatedMembers.size(), totalItems, tenantId);

    return new PaginatedResponse<>(paginatedMembers, page, pageSize, totalItems);
  }

  /**
   * Retrieves basic user info by Descope userId.
   *
   * @param userId The Descope user ID
   * @return User info containing userId, name, and email
   * @throws DescopeException If the user is not found or retrieval fails
   */
  public UserInfo getUserById(String userId) throws DescopeException {
    Log.infof("Retrieving user info for userId: %s", userId);

    UserResponseDetails userDetails =
        descopeClient.getManagementServices().getUserService().loadByUserId(userId);
    UserResponse user = userDetails.getUser();

    Log.infof("Retrieved user info for userId: %s, email: %s", userId, user.getEmail());

    return new UserInfo(user.getUserId(), user.getName(), user.getEmail());
  }
}
