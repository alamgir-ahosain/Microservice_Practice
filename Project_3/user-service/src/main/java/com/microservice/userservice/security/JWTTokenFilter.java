package com.microservice.userservice.security;

import com.microservice.userservice.jwt.JwtTokenHelper;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JWTTokenFilter extends OncePerRequestFilter {

    Logger logger = LoggerFactory.getLogger(JWTTokenFilter.class);

    @Autowired JwtTokenHelper jwtTokenHelper;
    @Autowired UserAuthenticationServiceImpl authenticationService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        logger.info("JWTTokenFilter: Authorization header = {}", authHeader);

        String token    = null;
        String userName = null;

        // only process if header exists AND starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token    = authHeader.substring(7);   // strip "Bearer " prefix
            userName = jwtTokenHelper.extractUsername(token);
            logger.info("JWTTokenFilter: Username extracted = {}", userName);
        } else {
            logger.info("JWTTokenFilter: No Bearer token found in request");
        }

        if (userName != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.info("JWTTokenFilter: Loading user from DB for username = {}", userName);
            UserDetails userDetails = authenticationService.loadUserByUsername(userName);

            boolean valid = jwtTokenHelper.isValidToken(token, userDetails.getUsername());
            logger.info("JWTTokenFilter: Token valid = {}", valid);

            if (valid) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()  // ✅ roles from getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.info("JWTTokenFilter: Security context set for {}", userName);
            }
        }

        filterChain.doFilter(request, response);
    }
}