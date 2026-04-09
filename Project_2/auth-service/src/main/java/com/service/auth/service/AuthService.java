package com.service.auth.service;

import com.service.auth.dto.request.LoginRequest;
import com.service.auth.dto.request.RegisterRequest;
import com.service.auth.dto.response.AuthResponse;
import com.service.auth.entity.User;
import com.service.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    // REGISTER
    public AuthResponse register(RegisterRequest req) {
        log.info("REGISTER attempt : email={}, role={}", req.getEmail(), req.getRole());

        if (userRepository.existsByEmail(req.getEmail())) {
            log.warn("REGISTER failed : email already exists: {}", req.getEmail());
            throw new IllegalArgumentException("Email already registered: " + req.getEmail());
        }

        User.Role role;
        try {
            role = User.Role.valueOf(req.getRole().toUpperCase());
        } catch (Exception e) {
            log.warn("REGISTER : unknown role '{}', defaulting to PATIENT", req.getRole());
            role = User.Role.PATIENT;
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        log.info("REGISTER success : email={}, role={}", user.getEmail(), user.getRole());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, user.getRole().name());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }



    // LOGIN
    public AuthResponse login(LoginRequest req) {
        log.info("LOGIN attempt : email={}", req.getEmail());

        // Step 1: Check user exists in DB
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null) {
            log.error("LOGIN failed : no user found with email: {}", req.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }
        log.info("LOGIN : user found in DB: email={}, role={}", user.getEmail(), user.getRole());

        // Step 2: Check password matches
        boolean passwordMatches = passwordEncoder.matches(req.getPassword(), user.getPassword());
        log.info("LOGIN : password BCrypt check: {}", passwordMatches ? "MATCH " : "NO MATCH ");
        if (!passwordMatches) {
            log.error("LOGIN failed : wrong password for email: {}", req.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        // Step 3: AuthenticationManager authenticate
        log.info("LOGIN : calling authenticationManager.authenticate()");
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            log.info("LOGIN : authenticationManager.authenticate() SUCCESS ");
        } catch (Exception e) {
            log.error("LOGIN : authenticationManager.authenticate() FAILED  : {}: {}",e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }

        // Step 4: Generate JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, user.getRole().name());
        log.info("LOGIN success : email={}, role={}, token starts with: {}",user.getEmail(), user.getRole(), token.substring(0, 20));

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }
}