
package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.dto.PageResponse;
import com.example.ecom_proj.dto.UserSearchCriteria;
import com.example.ecom_proj.dto.UserUpdateDTO;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserService service;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserService service, BCryptPasswordEncoder passwordEncoder) {
        this.service = service;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * GET /users - Get all users (simple list)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Users>>> getAllUsers() {
        List<Users> users = service.getAllUsers();
        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", users)
        );
    }

    /**
     * GET /users/search - Search users with pagination
     *
     * Query Parameters:
     *   - searchTerm: Search by username
     *   - role: Filter by role (ADMIN, STAFF, VIEWER)
     *   - sortBy: Field to sort by
     *   - sortDirection: ASC or DESC
     *   - page: Page number
     *   - size: Page size
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<Users>> searchUsers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Users.Role role,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        UserSearchCriteria criteria = UserSearchCriteria.builder()
                .searchTerm(searchTerm)
                .role(role)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .build();

        Page<Users> userPage = service.searchUsers(criteria);

        PageResponse.PageMetadata metadata = PageResponse.PageMetadata.builder()
                .currentPage(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();

        PageResponse<Users> response = PageResponse.of(userPage.getContent(), metadata);
        response.setSuccess(true);
        response.setMessage("Users retrieved successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * GET /users/{username} - Get a single user by username
     */
    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<Users>> getUserByUsername(@PathVariable String username) {
        Users user = service.getUserByUsername(username);
        return ResponseEntity.ok(
                ApiResponse.success("User retrieved successfully", user)
        );
    }

    /**
     * POST /users - Create a new user (ADMIN only)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Users>> createUser(@RequestBody Users user) {
        Users saved = service.addUser(user);
        saved.setPassword(null);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", saved));
    }

    /**
     * PUT /users/{username} - Update an existing user
     */
    @PutMapping("/{username}")
    public ResponseEntity<ApiResponse<Users>> updateUser(
            @PathVariable String username,
            @Valid @RequestBody UserUpdateDTO request) {

        // Ensure the username in the path matches the username in the body
        if (!username.equals(request.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username in path does not match username in body"));
        }

        // Convert DTO to entity
        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setRole(request.getRole());

        // Only set password if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(request.getPassword()); // Service will encode it
        }

        Users updated = service.updateUser(user);
        updated.setPassword(null);
        return ResponseEntity.ok(
                ApiResponse.success("User updated successfully", updated)
        );
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<ApiResponse<Users>> deleteUser(@PathVariable String username) {
        service.deleteUser(username);
        return ResponseEntity.ok(
                ApiResponse.success("User deleted successfully")
        );
    }
}