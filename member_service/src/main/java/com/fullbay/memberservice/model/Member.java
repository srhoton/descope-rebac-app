package com.fullbay.memberservice.model;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/** Represents a Descope member in a tenant. */
@Schema(description = "Descope member information")
public class Member {

  @Schema(description = "Unique member login identifier", example = "john.doe@example.com")
  private String loginId;

  @Schema(description = "Member display name", example = "John Doe")
  private String name;

  @Schema(description = "Member email address", example = "john.doe@example.com")
  private String email;

  @Schema(description = "Member phone number", example = "+1-555-0123")
  private String phone;

  @Schema(description = "Tenant ID this member belongs to", example = "T123456789")
  private String tenantId;

  /** Default constructor for JSON deserialization. */
  public Member() {}

  /**
   * Creates a new Member.
   *
   * @param loginId The member's login ID
   * @param name The member's display name
   * @param email The member's email address
   * @param phone The member's phone number
   * @param tenantId The tenant ID this member belongs to
   */
  public Member(String loginId, String name, String email, String phone, String tenantId) {
    this.loginId = loginId;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.tenantId = tenantId;
  }

  public String getLoginId() {
    return loginId;
  }

  public void setLoginId(String loginId) {
    this.loginId = loginId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }
}
