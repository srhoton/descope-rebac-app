package com.fullbay.memberservice;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import com.descope.exception.ServerCommonException;
import com.fullbay.memberservice.exception.MemberNotFoundException;
import com.fullbay.memberservice.model.Member;
import com.fullbay.memberservice.model.MemberRequest;
import com.fullbay.memberservice.model.PaginatedResponse;
import com.fullbay.memberservice.service.MemberService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;

@QuarkusTest
class MemberResourceTest {

  @InjectMock MemberService memberService;

  @Test
  @DisplayName("createMember - valid request - should return 201 with created member")
  void createMember_validRequest_shouldReturn201() throws Exception {
    // Given
    String tenantId = "tenant123";
    Member mockMember =
        new Member("user@example.com", "John Doe", "user@example.com", "+1234567890", tenantId);
    when(memberService.createMember(eq(tenantId), any(MemberRequest.class))).thenReturn(mockMember);

    MemberRequest request =
        new MemberRequest("user@example.com", "John Doe", "user@example.com", "+1234567890");

    // When/Then
    given()
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .post("/tenants/{tenantId}/members", tenantId)
        .then()
        .statusCode(201)
        .body("loginId", equalTo("user@example.com"))
        .body("name", equalTo("John Doe"))
        .body("tenantId", equalTo(tenantId));
  }

  @Test
  @DisplayName("createMember - service throws exception - should return 500")
  void createMember_serviceThrowsException_shouldReturn500() throws Exception {
    // Given
    String tenantId = "tenant123";
    when(memberService.createMember(eq(tenantId), any(MemberRequest.class)))
        .thenThrow(ServerCommonException.invalidArgument("Failed to create member"));

    MemberRequest request =
        new MemberRequest("user@example.com", "John Doe", "user@example.com", "+1234567890");

    // When/Then
    given()
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .post("/tenants/{tenantId}/members", tenantId)
        .then()
        .statusCode(500)
        .body("error", equalTo("Service error"));
  }

  @Test
  @DisplayName("getMember - valid loginId - should return 200 with member")
  void getMember_validLoginId_shouldReturn200() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";
    Member mockMember =
        new Member(loginId, "John Doe", "user@example.com", "+1234567890", tenantId);
    when(memberService.getMember(tenantId, loginId)).thenReturn(mockMember);

    // When/Then
    given()
        .when()
        .get("/tenants/{tenantId}/members/{loginId}", tenantId, loginId)
        .then()
        .statusCode(200)
        .body("loginId", equalTo(loginId))
        .body("name", equalTo("John Doe"));
  }

  @Test
  @DisplayName("getMember - member not found - should return 404")
  void getMember_memberNotFound_shouldReturn404() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "nonexistent@example.com";
    when(memberService.getMember(tenantId, loginId))
        .thenThrow(new MemberNotFoundException(tenantId, loginId));

    // When/Then
    given()
        .when()
        .get("/tenants/{tenantId}/members/{loginId}", tenantId, loginId)
        .then()
        .statusCode(404)
        .body("error", equalTo("Member not found"));
  }

  @Test
  @DisplayName("getAllMembers - valid request - should return 200 with paginated members")
  void getAllMembers_validRequest_shouldReturn200() throws Exception {
    // Given
    String tenantId = "tenant123";
    Member member1 =
        new Member("user1@example.com", "User One", "user1@example.com", null, tenantId);
    Member member2 =
        new Member("user2@example.com", "User Two", "user2@example.com", null, tenantId);

    PaginatedResponse<Member> mockResponse =
        new PaginatedResponse<>(Arrays.asList(member1, member2), 0, 20, 2);

    when(memberService.getAllMembers(eq(tenantId), anyInt(), anyInt())).thenReturn(mockResponse);

    // When/Then
    given()
        .queryParam("page", 0)
        .queryParam("pageSize", 20)
        .when()
        .get("/tenants/{tenantId}/members", tenantId)
        .then()
        .statusCode(200)
        .body("items.size()", is(2))
        .body("totalItems", is(2))
        .body("page", is(0));
  }

  @Test
  @DisplayName("updateMember - valid request - should return 200 with updated member")
  void updateMember_validRequest_shouldReturn200() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";
    Member updatedMember =
        new Member(loginId, "Jane Doe", "jane@example.com", "+0987654321", tenantId);

    when(memberService.updateMember(eq(tenantId), eq(loginId), any(MemberRequest.class)))
        .thenReturn(updatedMember);

    MemberRequest request =
        new MemberRequest(loginId, "Jane Doe", "jane@example.com", "+0987654321");

    // When/Then
    given()
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .put("/tenants/{tenantId}/members/{loginId}", tenantId, loginId)
        .then()
        .statusCode(200)
        .body("name", equalTo("Jane Doe"))
        .body("email", equalTo("jane@example.com"));
  }

  @Test
  @DisplayName("deleteMember - valid loginId - should return 204")
  void deleteMember_validLoginId_shouldReturn204() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";
    doNothing().when(memberService).deleteMember(tenantId, loginId);

    // When/Then
    given()
        .when()
        .delete("/tenants/{tenantId}/members/{loginId}", tenantId, loginId)
        .then()
        .statusCode(204);
  }

  @Test
  @DisplayName("deleteMember - service throws exception - should return 500")
  void deleteMember_serviceThrowsException_shouldReturn500() throws Exception {
    // Given
    String tenantId = "tenant123";
    String loginId = "user@example.com";
    doThrow(ServerCommonException.invalidArgument("Failed to delete member"))
        .when(memberService)
        .deleteMember(tenantId, loginId);

    // When/Then
    given()
        .when()
        .delete("/tenants/{tenantId}/members/{loginId}", tenantId, loginId)
        .then()
        .statusCode(500)
        .body("error", equalTo("Service error"));
  }
}
