package com.example.ecom_proj.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditSearchCriteria {

    // Text search - searches across name, serial number, etc.
    private String searchTerm;

    // Specific field filters
    private String entityName;
    private Long entityId;
    private String actionType;
    private String performedBy;

    // Date range filters
    private LocalDate performedDateFrom;
    private LocalDate performedDateTo;


    // Sorting
    private String sortBy;  // field name to sort by
    private String sortDirection;  // ASC or DESC

    // Pagination
    private Integer page;  // 0-based page number
    private Integer size;  // page size
}
