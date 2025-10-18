
package com.example.ecom_proj.configuration;

import com.example.ecom_proj.security.JwtAuthenticationFilter;
import com.example.ecom_proj.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security Configuration with JWT Authentication
 *
 * KEY CHANGES FROM BASIC AUTH:
 * 1. Added JWT filter to intercept and validate tokens
 * 2. Changed session management to STATELESS (no server sessions)
 * 3. Removed HTTP Basic Auth
 * 4. Token is now sent in Authorization header instead of Basic Auth
 *
 * AUTHENTICATION FLOW:
 * 1. User sends POST /auth/login with username/password
 * 2. Server validates credentials and returns JWT token
 * 3. Client stores token (localStorage/sessionStorage)
 * 4. Client sends token in header: Authorization: Bearer <token>
 * 5. JWT filter validates token on each request
 * 6. If valid, user is authenticated
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Enable @PreAuthorize, @Secured annotations
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Value("${cors.allowed.origins}") // <-- ADD THIS LINE
    private String allowedOrigins;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            BCryptPasswordEncoder passwordEncoder,
            JwtAuthenticationFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /**
     * SECURITY FILTER CHAIN
     *
     * Defines the security rules for your application.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/health").permitAll()
                        .requestMatchers("/auth/login", "/auth/register", "/auth/check" ).permitAll()
                        .requestMatchers("/auth/logout", "/auth/me", "/auth/change-password").authenticated()
                        .requestMatchers("/users/**").hasRole("ADMIN")
                        .requestMatchers("/assets/**", "/asset-categories/**", "/audits/**", "/asset-transactions/**", "/reports/**")
                        .hasAnyRole("ADMIN", "STAFF", "VIEWER")
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/borrow-requests", "/borrow-requests/check").authenticated() // Any logged-in user can create or check a request
                        .requestMatchers("/borrow-requests/my").authenticated() // Any logged-in user can see their own requests
                        .requestMatchers(HttpMethod.DELETE, "/borrow-requests/{id}").authenticated() // Any logged-in user can attempt to cancel (service logic verifies ownership)
                        .requestMatchers("/borrow-requests", "/borrow-requests/{id}/approve", "/borrow-requests/{id}/decline").hasAnyRole("ADMIN", "STAFF") // Only Admin/Staff can list all, approve, or decline


                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // ✅ move JWT filter AFTER CORS & CSRF
                .addFilterAfter(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Use the injected variable, splitting by comma for multiple origins
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


    /**
     * AUTHENTICATION PROVIDER
     *
     * Tells Spring Security:
     * 1. Where to load users from (UserDetailsService)
     * 2. How to verify passwords (BCryptPasswordEncoder)
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    /**
     * AUTHENTICATION MANAGER
     *
     * The "manager" that coordinates the authentication process
     * Used in the login endpoint to authenticate username/password
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}