package com.example.ecom_proj.dto;

import com.example.ecom_proj.model.AssetTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetTransactionSearchCriteria {

    // Text search - searches across name, serial number, etc.
    private String searchTerm;

    // Specific field filters
    private String assetName;
    private String userName;
    private String notes;
    private AssetTransaction.TransactionAction action;


    // Date range filters
    private LocalDate transactionDateFrom;
    private LocalDate transactionDateTo;

    // Sorting
    private String sortBy;  // field name to sort by
    private String sortDirection;  // ASC or DESC

    // Pagination
    private Integer page;  // 0-based page number
    private Integer size;  // page size
}
