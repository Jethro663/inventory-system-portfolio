
package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
@CrossOrigin
public class MainController {

    /**
     * GET / - API information and available endpoints
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApiInfo() {
        Map<String, Object> apiInfo = new HashMap<>();
        apiInfo.put("name", "Inventory Management API");
        apiInfo.put("version", "1.0.0");
        apiInfo.put("status", "active");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("authentication", "/auth");
        endpoints.put("users", "/users");
        endpoints.put("assets", "/assets");
        endpoints.put("categories", "/asset-categories");
        apiInfo.put("endpoints", endpoints);

        return ResponseEntity.ok(
                ApiResponse.success("API information retrieved", apiInfo)
        );
    }

    /**
     * GET /health - Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(
                ApiResponse.success("Service is healthy", health)
        );
    }
}