// FILE: src/main/java/com/example/ecom_proj/model/Asset.java
package com.example.ecom_proj.model;

import com.example.ecom_proj.dto.BorrowedBy; // NOTE: DTO used for transient field
import com.fasterxml.jackson.annotation.JsonInclude; // NOTE: only include borrowedBy if non-null
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "categoryId")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Asset name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Serial number is required")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Serial number must contain only uppercase letters, numbers, and hyphens")
    @Column(unique = true, nullable = false)
    private String serialNumber;

    @ManyToOne
    @NotNull(message = "Asset category is required")
    @JoinColumn(name = "category_id")
    private AssetCategory category;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    private AssetStatus status;

    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    @Positive(message = "Cost must be positive")
    @DecimalMin(value = "0.01", message = "Cost must be at least 0.01")
    private Double cost;

    @Column(name = "image_url")
    private String imageUrl;

    /**
     * Enum for Asset Status
     * Better than using plain strings - prevents typos and invalid values
     */
    public enum AssetStatus {
        AVAILABLE,      // Ready to be assigned
        IN_USE,         // Currently assigned to someone
        MAINTENANCE,    // Being repaired/maintained
        DAMAGED,        // Broken/unusable
        RETIRED         // No longer in service
    }

    // ----------------------------------------------------------------
    // Transient borrower info — filled at runtime by AssetService
    // ----------------------------------------------------------------
    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL) // only send borrower if present
    private BorrowedBy borrowedBy; // NOTE: not persisted; computed from AssetTransaction logs

    // NOTE: Lombok @Data gives getter/setter for borrowedBy automatically.
}
