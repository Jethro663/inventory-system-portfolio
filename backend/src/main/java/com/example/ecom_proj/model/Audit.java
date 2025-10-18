package com.example.ecom_proj.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Entity name is required")
    @Size(max = 100, message = "Entity name cannot exceed 100 characters")
    private String entityName;

    @NotNull(message = "Entity ID is required")
    private Long entityId;

    @NotBlank(message = "Action type is required")
    @Size(max = 50, message = "Action type cannot exceed 50 characters")
    private String actionType;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    @NotBlank(message = "Performer is required")
    @Size(max = 100, message = "Performer name cannot exceed 100 characters")
    private String performedBy;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime performedAt;
}