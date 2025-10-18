package com.example.ecom_proj.service;

import com.example.ecom_proj.model.Notification;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Minimal notification service. Stores notification rows in DB.
 */
@Service
public class NotificationService {

    private final NotificationRepository repo;
    private final UserService userService; // reuse existing user service for lookups if needed

    public NotificationService(NotificationRepository repo, UserService userService) {
        this.repo = repo;
        this.userService = userService;
    }

    /**
     * Create and persist a notification for a specific user.
     */
    public Notification createNotification(Users recipient, String message) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setMessage(message);
        n.setRead(false);
        return repo.save(n);
    }

    /**
     * Convenience to create notification by username (if needed).
     */
    public Notification createNotificationForUsername(String username, String message) {
        Users u = userService.getUserByUsername(username); // will throw if not found
        return createNotification(u, message);
    }

    public List<Notification> getNotificationsForUser(Users recipient) {
        return repo.findByRecipientOrderByCreatedAtDesc(recipient);
    }

    public void markAsRead(Long notificationId) {
        repo.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }
}
