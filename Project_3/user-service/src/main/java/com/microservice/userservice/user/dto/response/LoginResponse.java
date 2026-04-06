package com.microservice.userservice.user.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String accessToken;
    private String userId;
    private String name;
    private String email;
    private String role;      // "USER" or "ADMIN"
}