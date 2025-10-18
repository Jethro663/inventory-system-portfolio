
package com.example.ecom_proj.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AssetTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE}) // ADD THIS
    @NotNull(message = "Asset is required for transaction")
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE}) // ADD THIS for Users too if needed
    @NotNull(message = "User is required for transaction")
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @NotNull(message = "Transaction action is required")
    @Enumerated(EnumType.STRING)
    private TransactionAction action;

    @NotNull(message = "Transaction date is required")
    @PastOrPresent(message = "Transaction date cannot be in the future")
    private LocalDateTime transactionDate;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    /**
     * Enum for Transaction Actions
     */
    public enum TransactionAction {
        CREATE,
        AVAILABLE,      // Asset assigned to user
        IN_USE,        // Asset returned// Asset transferred to another user
        MAINTENANCE,   // Sent for maintenance
        DAMAGED,        // Sent for repair
        RETIRE,         // Asset retired/decommissioned
    }

    /**
     * Automatically set the transaction date before persisting
     */
    @PrePersist
    protected void onCreate() {
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
    }
}