package com.microservice.userservice.jwt;

import com.microservice.userservice.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
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
    private long TOKEN_EXPIRY_DURATION;  // e.g. 86400000 = 24 hours

    public SecretKey getSecretKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

   // Create JWT Token
    public String createToken(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role",    user.getRole().name());   // "USER" or "ADMIN"
        extraClaims.put("userId",  user.getId());
        extraClaims.put("name",    user.getName());

        return Jwts.builder()
                .claims(extraClaims)
                .subject(user.getEmail())          // email as subject (used for loadUserByUsername)
                .issuedAt(new Date(System.currentTimeMillis())) // Creation time
                .expiration(new Date(System.currentTimeMillis() + TOKEN_EXPIRY_DURATION)) // Expire time
                .signWith(getSecretKey()) // "alg": "HS256", "typ": "JWT" auto-set //! JJWT automatically sets `"alg": "HS256"` when using an HMAC key.It also adds `"typ": "JWT"` to mark the  token as a JSON Web Token.
                .compact();
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


