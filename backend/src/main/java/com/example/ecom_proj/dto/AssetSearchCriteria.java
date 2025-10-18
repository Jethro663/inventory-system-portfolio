package com.example.ecom_proj.dto;

import com.example.ecom_proj.model.Asset;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for Asset search/filter criteria
 * All fields are optional - only provided fields will be used in search
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetSearchCriteria {

    // Text search - searches across name, serial number, etc.
    private String searchTerm;

    // Specific field filters
    private String name;
    private String serialNumber;
    private Long categoryId;
    private String categoryName;
    private Asset.AssetStatus status;

    // Date range filters
    private LocalDate purchaseDateFrom;
    private LocalDate purchaseDateTo;

    // Cost range filters
    private Double minCost;
    private Double maxCost;

    // Sorting
    private String sortBy;  // field name to sort by
    private String sortDirection;  // ASC or DESC

    // Pagination
    private Integer page;  // 0-based page number
    private Integer size;  // page size
}