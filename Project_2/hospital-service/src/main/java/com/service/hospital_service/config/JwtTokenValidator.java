package com.service.hospital_service.config;



import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

/**
 * Hospital-service only VALIDATES tokens.
 * It never generates them — that's the auth-service's job.
 * Uses the same secret key to verify the signature.
 */
@Component
public class JwtTokenValidator {

    @Value("${jwt.secret}")
    private String secretKey;

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, c -> c.get("role", String.class));
    }

    public boolean isTokenValid(String token) {
        try {
            return !extractClaim(token, Claims::getExpiration).before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(
            Jwts.parser().verifyWith(getSigningKey()).build()
               .parseSignedClaims(token).getPayload()
        );
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }
}