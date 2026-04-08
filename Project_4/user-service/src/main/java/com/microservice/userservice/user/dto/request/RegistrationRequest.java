package com.microservice.userservice.user.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistrationRequest{

        @NotNull(message = "Name cannot be blank")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters long.")
       private String name;

        @NotNull(message = "Email cannot be blank")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

}