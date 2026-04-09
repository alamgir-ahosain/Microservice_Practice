package com.service.auth.service;

import com.service.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("loadUserByUsername called : email={}", email);

        com.service.auth.entity.User user = userRepository.findByEmail(email).orElseThrow(() -> {
                    log.error("loadUserByUsername : NO USER FOUND for email: {}", email);
                    return new UsernameNotFoundException("User not found: " + email);
                });

        log.info("loadUserByUsername : found user: email={}, role={}, passwordHash starts={}",
                user.getEmail(),
                user.getRole(),
                user.getPassword() != null ? user.getPassword().substring(0, 10) : "NULL ");

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }
}