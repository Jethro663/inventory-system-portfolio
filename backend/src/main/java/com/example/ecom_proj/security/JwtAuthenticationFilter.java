package com.example.ecom_proj.security;

import com.example.ecom_proj.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 *
 * This filter intercepts EVERY HTTP request and checks for a valid JWT token.
 *
 * FLOW:
 * 1. Extract JWT token from Authorization header
 * 2. Validate the token
 * 3. If valid, load user details and set authentication
 * 4. Continue with the request
 *
 * HEADER FORMAT:
 * Authorization: Bearer <token>
 * Example: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Main filter logic - executed for every request
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {


        // 1. Extract Authorization header
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 2. Check if header exists and starts with "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // Extract token (remove "Bearer " prefix)
            jwt = authorizationHeader.substring(7);

            try {
                // Extract username from token
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Token is invalid or malformed
                logger.error("Error extracting username from JWT", e);
            }
        }

        // 3. If we have a username and no authentication is set yet
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Load user details from database
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 4. Validate token
            if (jwtUtil.validateToken(jwt, userDetails)) {
                // Token is valid - set authentication
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Set authentication in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);

                logger.debug("JWT token validated for user: " + username);
            }
        }

        // 5. Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}