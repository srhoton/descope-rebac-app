package com.fullbay.memberservice.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/** Request object for creating or updating a member. */
@Schema(description = "Request payload for creating or updating a member")
public class MemberRequest {

  @NotBlank(message = "Login ID is required")
  @Size(min = 1, max = 255, message = "Login ID must be between 1 and 255 characters")
  @Schema(description = "Unique member login identifier", example = "john.doe@example.com")
  private String loginId;

  @Size(max = 255, message = "Name must not exceed 255 characters")
  @Schema(description = "Member display name", example = "John Doe")
  private String name;

  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
  @Schema(description = "Member email address", required = true, example = "john.doe@example.com")
  private String email;

  @Size(max = 50, message = "Phone number must not exceed 50 characters")
  @Schema(description = "Member phone number", example = "+1-555-0123")
  private String phone;

  /** Default constructor for JSON deserialization. */
  public MemberRequest() {}

  /**
   * Creates a new MemberRequest.
   *
   * @param loginId The member's login ID
   * @param name The member's display name
   * @param email The member's email address
   * @param phone The member's phone number
   */
  public MemberRequest(String loginId, String name, String email, String phone) {
    this.loginId = loginId;
    this.name = name;
    this.email = email;
    this.phone = phone;
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
}
