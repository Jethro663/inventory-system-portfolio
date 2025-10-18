
package com.example.ecom_proj.dto;

import com.example.ecom_proj.model.Users;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication responses
 * Now includes JWT token
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String username;
    private Users.Role role;
    private String message;
    private Long userId;

    /**
     * JWT token - sent to client after successful login
     * Client should store this and send it with subsequent requests
     */
    private String token;

    /**
     * Token type - always "Bearer" for JWT
     */
    @Builder.Default
    private String tokenType = "Bearer";
}