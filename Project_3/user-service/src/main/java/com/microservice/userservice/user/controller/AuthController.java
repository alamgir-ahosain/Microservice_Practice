package com.microservice.userservice.user.controller;


import com.microservice.userservice.user.dto.request.LoginRequest;
import com.microservice.userservice.user.dto.request.RegistrationRequest;
import com.microservice.userservice.user.dto.response.LoginResponse;
import com.microservice.userservice.user.service.implementation.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")   // matches the permitAll() pattern in SecurityConfig
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}