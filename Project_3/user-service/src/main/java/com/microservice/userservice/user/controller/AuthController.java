package com.microservice.userservice.user.controller;

import com.microservice.userservice.user.dto.request.LoginRequest;
import com.microservice.userservice.user.dto.request.RegistrationRequest;
import com.microservice.userservice.user.dto.response.LoginResponse;
import com.microservice.userservice.user.service.implementation.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class AuthController {

    Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegistrationRequest request) {
        logger.info("AuthController: POST /public/register called");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        logger.info("AuthController: POST /public/login called"); //  if this never logs, controller not mapped
        return ResponseEntity.ok(authService.login(request));
    }
}