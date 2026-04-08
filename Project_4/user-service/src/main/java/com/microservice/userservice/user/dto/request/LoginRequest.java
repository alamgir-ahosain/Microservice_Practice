package com.microservice.userservice.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
        @NotBlank(message = "Email cannot be blank")
        String email;
        String password;
}
