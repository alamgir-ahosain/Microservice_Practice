package com.microservice.userservice.jwt;

import com.microservice.userservice.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenHelper {

    Logger logger = LoggerFactory.getLogger(JwtTokenHelper.class);

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long TOKEN_EXPIRY_DURATION;

    @PostConstruct
    public void init() {
        logger.info("JwtTokenHelper: SECRET_KEY loaded = {}",
                SECRET_KEY != null ? "YES (length=" + SECRET_KEY.length() + ")" : "NULL");
        logger.info("JwtTokenHelper: TOKEN_EXPIRY_DURATION = {}", TOKEN_EXPIRY_DURATION);
    }

    public SecretKey getSecretKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY); // throws if invalid Base64
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits (32 bytes)");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Create JWT Token
    public String createToken(User user) {
        logger.info("JwtTokenHelper: Creating token for user = {}", user.getEmail());
        try {
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("userId", user.getId());
            extraClaims.put("name", user.getName());

            String token = Jwts.builder()
                    .claims(extraClaims)
                    .subject(user.getEmail())
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + TOKEN_EXPIRY_DURATION))
                    .signWith(getSecretKey())
                    .compact();

            logger.info("JwtTokenHelper: Token created successfully = {}", token.substring(0, 20));
            return token;
        } catch (Exception e) {
            logger.error("JwtTokenHelper: Failed to create token", e);
            throw e;
        }
    }

    // extract Username from token claims
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    // extract role from token claims
    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    // extract userId from token claims
    public String extractUserId(String token) {
        return parseClaims(token).get("userId", String.class);
    }

    // Check if token is expired
    public boolean isTokenExpired(String token) {
        Date expiryTime = parseClaims(token).getExpiration();
        logger.info("JwtTokenHelper: Token expiry = {}", expiryTime);
        return expiryTime.before(new Date());
    }

    // Validate token
    public boolean isValidToken(String token, String requestedUsername) {
        String usernameFromToken = extractUsername(token);
        logger.info("JwtTokenHelper: Username from token = {}", usernameFromToken);
        return usernameFromToken.equalsIgnoreCase(requestedUsername) && !isTokenExpired(token);
    }

    // returns the full claims object
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
