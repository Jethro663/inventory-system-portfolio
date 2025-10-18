package com.example.ecom_proj.repository;

import com.example.ecom_proj.model.Notification;
import com.example.ecom_proj.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(Users recipient);
}
