package com.fullbay.memberservice.model;

/** Simple user info for display purposes. Contains basic user details without tenant context. */
public record UserInfo(String userId, String name, String email) {}
