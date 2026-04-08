package com.microservice.userservice.user.service.implementation;

import com.microservice.userservice.jwt.JwtTokenHelper;
import com.microservice.userservice.user.dto.enums.Role;
import com.microservice.userservice.user.dto.request.LoginRequest;
import com.microservice.userservice.user.dto.request.RegistrationRequest;
import com.microservice.userservice.user.dto.response.LoginResponse;
import com.microservice.userservice.user.entity.User;
import com.microservice.userservice.user.repository.UserRepository;
import com.microservice.userservice.user.service.abstraction.AuthService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenHelper jwtTokenHelper;



    @Override
    public LoginResponse register(RegistrationRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {  throw new RuntimeException("Email is already registered: " + request.getEmail());  }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // everyone starts as USER
                .enabled(true)
                .build();

        User saved = userRepository.save(user);

        // now passes full User object so role+userId get embedded in JWT
        String token = jwtTokenHelper.createToken(saved);

        return LoginResponse.builder()
                .accessToken(token)
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .build();
    }






    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {    throw new RuntimeException("Invalid email or password");  }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {throw new RuntimeException("Invalid email or password");      }

        String token = jwtTokenHelper.createToken(user);

        return LoginResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}