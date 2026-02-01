package com.fullbay.memberservice.exception;

/** Exception thrown when a member is not found in the specified tenant. */
public class MemberNotFoundException extends RuntimeException {

  private final String tenantId;
  private final String loginId;

  /**
   * Creates a new MemberNotFoundException.
   *
   * @param tenantId The tenant ID
   * @param loginId The member's login ID
   */
  public MemberNotFoundException(String tenantId, String loginId) {
    super(String.format("Member %s not found in tenant %s", loginId, tenantId));
    this.tenantId = tenantId;
    this.loginId = loginId;
  }

  /**
   * Gets the tenant ID.
   *
   * @return The tenant ID
   */
  public String getTenantId() {
    return tenantId;
  }

  /**
   * Gets the login ID.
   *
   * @return The login ID
   */
  public String getLoginId() {
    return loginId;
  }
}
