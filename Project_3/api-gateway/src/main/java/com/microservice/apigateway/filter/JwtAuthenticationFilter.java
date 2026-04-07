package com.microservice.apigateway.filter;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.*;
import org.springframework.core.Ordered;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final List<String> PUBLIC_EXACT = List.of(
            "/public/register",
            "/public/login");

    private static final List<String> PUBLIC_PREFIX = List.of(
            "/api/products");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();
        HttpMethod method = exchange.getRequest().getMethod();

        log.info("Gateway filter hit => method={}, path={}", method, path);

        // 1. Allow preflight
        if (HttpMethod.OPTIONS.equals(method)) {
            log.info("OPTIONS preflight — passing through");
            return chain.filter(exchange);
        }

        // 2. Exact public paths
        if (PUBLIC_EXACT.stream().anyMatch(path::equalsIgnoreCase)) {
            log.info("Public exact path matched — passing through: {}", path);
            return chain.filter(exchange);
        }

        // 3. GET on public prefixes (browse products without login)
        if (HttpMethod.GET.equals(method) &&
                PUBLIC_PREFIX.stream().anyMatch(path::startsWith)) {
            log.info("Public GET prefix matched — passing through: {}", path);
            return chain.filter(exchange);
        }

        // 4. Require JWT for everything else
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        log.info("Checking JWT for path={}, authHeader present={}", path, authHeader != null);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or malformed Authorization header for path={}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        try {
            String token = authHeader.substring(7);
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(keyBytes))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String userId = claims.get("userId", String.class);
            String role = claims.get("role", String.class);
            String email = claims.getSubject();

            log.info("JWT valid — userId={}, role={}, email={}, routing to: {}", userId, role, email, path);

            return chain.filter(exchange.mutate().request(r -> r
                    .header("X-User-Id", userId)
                    .header("X-User-Role", role)
                    .header("X-User-Email", email)).build());

        } catch (ExpiredJwtException e) {
            log.warn("JWT expired for path={}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        } catch (JwtException e) {
            log.warn("JWT invalid for path={}: {}", path, e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}