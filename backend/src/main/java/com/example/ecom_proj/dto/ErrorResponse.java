package com.example.ecom_proj.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Detailed Error Response
 * Used for validation errors and detailed error information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private boolean success;
    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;

    // For validation errors - field-level error details
    private Map<String, String> errors;

    /**
     * Create a simple error response
     */
    public static ErrorResponse of(int status, String error, String message, String path) {
        return ErrorResponse.builder()
                .success(false)
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a validation error response with field errors
     */
    public static ErrorResponse validationError(String message, Map<String, String> fieldErrors, String path) {
        return ErrorResponse.builder()
                .success(false)
                .status(400)
                .error("Validation Failed")
                .message(message)
                .errors(fieldErrors)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }
}