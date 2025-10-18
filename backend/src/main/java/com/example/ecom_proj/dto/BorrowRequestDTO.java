package com.example.ecom_proj.dto;

import com.example.ecom_proj.model.BorrowRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO returned to frontend for borrow requests (viewer-facing).
 *
 * Includes assetName and processedBy username to reduce client-side traversal.
 */
@Data
@Builder
public class BorrowRequestDTO {
    private Long id;
    private String assetName;
    private String status;
    private LocalDateTime requestedAt;
    private String processedBy; // admin username (nullable)
    private String note;
    private String declineReason;
    private String requesterUsername;
    private Long assetId;

    public static BorrowRequestDTO fromEntity(BorrowRequest br) {
        return BorrowRequestDTO.builder()
                .id(br.getId())
                .assetId(br.getAsset() != null ? br.getAsset().getId() : null)
                .assetName(br.getAsset() != null ? br.getAsset().getName() : null)
                .status(br.getStatus() != null ? br.getStatus().name() : null)
                .requestedAt(br.getCreatedAt())
                .processedBy(br.getProcessedBy() != null ? br.getProcessedBy().getUsername() : null)
                .note(br.getNote())
                .declineReason(br.getDeclineReason())
                .requesterUsername(br.getRequester() != null ? br.getRequester().getUsername() : null)
                .build();
    }
}
