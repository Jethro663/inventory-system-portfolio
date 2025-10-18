package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.model.Notification;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.service.NotificationService;
import com.example.ecom_proj.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Minimal REST endpoints for notifications:
 */
@RestController
@CrossOrigin
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> list(@RequestParam Long userId) {
        Users user = userService.getUserById(userId);
        throw new UnsupportedOperationException("User not Found");
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
