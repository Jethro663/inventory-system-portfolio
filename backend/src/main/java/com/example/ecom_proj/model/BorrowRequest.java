package com.example.ecom_proj.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * BorrowRequest entity — represents a user's request to borrow an asset.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "borrow_request")
public class BorrowRequest {

    // NOTE: Primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // NOTE: Asset being requested
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    // NOTE: Requesting user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private Users requester;

    // NOTE: Optional note provided by requester
    @Column(columnDefinition = "text")
    @Size(max = 2000)
    private String note;

    // NOTE: Request status
    public enum Status {
        PENDING,
        APPROVED,
        DECLINED,
        COMPLETE
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    // NOTE: When the request was created
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // NOTE: Admin who processed (approved/declined)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private Users processedBy;

    // NOTE: When it was processed
    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    // NOTE: Optional decline reason
    @Column(name = "decline_reason", columnDefinition = "text")
    private String declineReason;
}
