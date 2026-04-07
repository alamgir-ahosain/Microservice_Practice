package com.microservice.userservice.user.service.implementation;

import com.microservice.userservice.jwt.JwtTokenHelper;
import com.microservice.userservice.user.dto.enums.Role;
import com.microservice.userservice.user.dto.request.LoginRequest;
import com.microservice.userservice.user.dto.request.RegistrationRequest;
import com.microservice.userservice.user.dto.response.LoginResponse;
import com.microservice.userservice.user.entity.User;
import com.microservice.userservice.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AuthService {

    Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; //  interface, not BCryptPasswordEncoder
    private final JwtTokenHelper jwtTokenHelper;

    public LoginResponse register(RegistrationRequest request) {
        logger.info("AuthService: register called for email = {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered: " + request.getEmail());
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        logger.info("AuthService: password hashed = {}", hashedPassword);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(hashedPassword)
                .role(Role.USER)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        logger.info("AuthService: user saved with id = {}", saved.getId());

        String token = jwtTokenHelper.createToken(saved);
        logger.info("AuthService: token created = {}", token);

        return LoginResponse.builder()
                .accessToken(token)
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        logger.info("AuthService: login called for email = {}", request.getEmail());

        // Step 1 - find user
        User user = userRepository.findByEmail(request.getEmail());
        logger.info("AuthService: user found = {}", user != null);

        if (user == null) {
            logger.warn("AuthService: user NOT found for email = {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        // Step 2 - check password
        logger.info("AuthService: stored hash = {}", user.getPassword());
        logger.info("AuthService: input password = {}", request.getPassword());

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        logger.info("AuthService: password matches = {}", matches); // ← watch this line

        if (!matches) {
            logger.warn("AuthService: password does NOT match for email = {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        // Step 3 - create token
        String token = jwtTokenHelper.createToken(user);
        logger.info("AuthService: token created successfully for {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}