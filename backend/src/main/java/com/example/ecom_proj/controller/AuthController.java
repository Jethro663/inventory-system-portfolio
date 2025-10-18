
package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.*;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.UserRepository;
import com.example.ecom_proj.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication Controller
 * Handles all authentication-related operations
 *
 * Endpoints:
 *   POST /auth/login       - User login
 *   POST /auth/register    - Public registration (VIEWER role)
 *   POST /auth/logout      - User logout
 *   POST /auth/change-password - Change password (requires auth)
 *   GET  /auth/me          - Get current user info
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * POST /auth/login - Authenticate user
     *
     * Request Body:
     * {
     *   "username": "john_doe",
     *   "password": "password123"
     * }
     *
     * Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "username": "john_doe",
     *     "role": "ADMIN",
     *     "userId": 1
     *   }
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    /**
     * POST /auth/register - Register new user (public endpoint)
     * New users are assigned VIEWER role by default
     *
     * Request Body:
     * {
     *   "username": "new_user",
     *   "password": "password123",
     *   "confirmPassword": "password123"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    /**
     * POST /auth/logout - Logout user
     * Requires authentication
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        String username = authentication.getName();
        authService.logout(username);
        return ResponseEntity.ok(
                ApiResponse.success("Logout successful")
        );
    }

    /**
     * POST /auth/change-password - Change password for authenticated user
     * Requires authentication
     *
     * Request Body:
     * {
     *   "currentPassword": "oldpass123",
     *   "newPassword": "newpass123",
     *   "confirmPassword": "newpass123"
     * }
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        String username = authentication.getName();
        authService.changePassword(username, request);

        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully")
        );
    }

    /**
     * GET /auth/me - Get current authenticated user information
     * Requires authentication
     *
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "username": "john_doe",
     *     "authenticated": true
     *   }
     * }
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        Users user = userRepository.findByUsername(authentication.getName());
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Map<String, Object> userInfo = Map.of(
                "username", authentication.getName(),
                    "id", user.getId(),
                "role",user.getRole().name(),
                "authorities", authentication.getAuthorities(),
                "authenticated", authentication.isAuthenticated()
        );

        return ResponseEntity.ok(
                ApiResponse.success("User information retrieved", userInfo)
        );
    }

    /**
     * GET /auth/check - Check if user is authenticated
     * Public endpoint - returns authentication status
     */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAuth(Authentication authentication) {
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Authentication status checked",
                        Map.of("authenticated", isAuthenticated)
                )
        );
    }
}