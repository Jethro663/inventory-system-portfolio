package com.example.ecom_proj.dto;

import com.example.ecom_proj.model.Users;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for User search/filter criteria
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchCriteria {

    private String searchTerm;  // Search username
    private Users.Role role;    // Filter by role

    // Sorting
    private String sortBy;
    private String sortDirection;

    // Pagination
    private Integer page;
    private Integer size;
}