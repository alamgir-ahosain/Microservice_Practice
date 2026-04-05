package com.service.auth.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String name;
    private String role;

    public AuthResponse(String token, String email, String name, String role) {
        this.token = token;
        this.email = email;
        this.name  = name;
        this.role  = role;
    }
}