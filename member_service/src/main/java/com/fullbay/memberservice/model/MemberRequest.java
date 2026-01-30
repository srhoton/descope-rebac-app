package com.fullbay.memberservice.model;

/** Request object for creating or updating a member. */
public class MemberRequest {

  private String loginId;
  private String name;
  private String email;
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
