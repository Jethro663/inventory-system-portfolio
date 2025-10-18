package com.example.ecom_proj.service;

import com.example.ecom_proj.dto.AuthRequest;
import com.example.ecom_proj.dto.AuthResponse;
import com.example.ecom_proj.dto.ChangePasswordRequest;
import com.example.ecom_proj.dto.RegisterRequest;
import com.example.ecom_proj.exceptions.InvalidCredentialsException;
import com.example.ecom_proj.exceptions.PasswordMismatchException;
import com.example.ecom_proj.exceptions.UserAlreadyExistsException;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.UserRepository;
import com.example.ecom_proj.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for authentication operations with JWT
 *
 * KEY CHANGES:
 * - Now generates JWT tokens after successful authentication
 * - Uses AuthenticationManager for credential validation
 * - Returns token in AuthResponse
 */
@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public AuthService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            AuditService auditService,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Authenticate user with username and password
     * Now returns JWT token
     *
     * FLOW:
     * 1. Authenticate username/password using AuthenticationManager
     * 2. If valid, load user details
     * 3. Generate JWT token
     * 4. Return token + user info
     */
    public AuthResponse login(AuthRequest request) {
        try {
            // 1. Authenticate credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            log.warn("Failed login attempt for user: {}", request.getUsername());
            throw new InvalidCredentialsException("Invalid username or password");
        }

        // 2. Load user details
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final Users user = userRepository.findByUsername(request.getUsername());

        // 3. Generate JWT token
        final String jwt = jwtUtil.generateToken(userDetails);

        log.info("User {} logged in successfully", user.getUsername());

        // 4. Log authentication event

        auditService.log("LOGIN",
                user.getUsername(),
                user.getId(),
                null,
                null
        );


        // 5. Return response with token
        return AuthResponse.builder()
                .username(user.getUsername())
                .role(user.getRole())
                .userId(user.getId())
                .token(jwt)
                .tokenType("Bearer")
                .message("Login successful")
                .build();
    }

    /**
     * Register a new user (public registration)
     * Now also returns JWT token so user is immediately logged in
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Passwords do not match");
        }

        // Check if user already exists
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new UserAlreadyExistsException(request.getUsername());
        }

        // Create new user with VIEWER role (security measure)
        Users newUser = new Users();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(Users.Role.VIEWER);

        Users saved = userRepository.save(newUser);
        log.info("New user registered: {}", saved.getUsername());

        // Generate JWT token for immediate login
        final UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        // Log registration event


        auditService.log("REGISTER",
                saved.getUsername(),
                saved.getId(),
                null,
                saved.toString()
        );



        return AuthResponse.builder()
                .username(saved.getUsername())
                .role(saved.getRole())
                .userId(saved.getId())
                .token(jwt)
                .tokenType("Bearer")
                .message("Registration successful")
                .build();
    }

    /**
     * Change password for authenticated user
     */
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        // Validate new passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("New passwords do not match");
        }

        Users user = userRepository.findByUsername(username);
        if (user == null) {
            throw new InvalidCredentialsException("User not found");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Invalid current password attempt for user: {}", username);
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Prevent using the same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new PasswordMismatchException("New password must be different from current password");
        }

        // Update password
        String oldPasswordHash = user.getPassword();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", username);

        // Log password change event


        auditService.log("PASSWORD_CHANGE",
                user.getUsername(),
                user.getId(),
                null,
                user.toString()
        );



    }

    /**
     * Get currently authenticated user
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }

    /**
     * Logout
     *
     * NOTE: With JWT, logout is primarily client-side.
     * Client should delete the stored token.
     * Server can optionally maintain a blacklist of tokens (advanced feature).
     */
    public void logout(String username) {
        log.info("User {} logged out", username);

        Users user = userRepository.findByUsername(username);
        if (user != null) {

            auditService.log("LOGOUT",
                    user.getUsername(),
                    user.getId(),
                    null,
                    user.toString()
            );

        }
    }
}