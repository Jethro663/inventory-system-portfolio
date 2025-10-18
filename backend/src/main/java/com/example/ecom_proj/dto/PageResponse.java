package com.example.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Paginated Response Wrapper
 * For endpoints that return paginated data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private boolean success;
    private String message;
    private List<T> data;
    private PageMetadata pagination;
    private LocalDateTime timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageMetadata {
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;
    }

    /**
     * Create a paginated response
     */
    public static <T> PageResponse<T> of(List<T> data, PageMetadata metadata) {
        return PageResponse.<T>builder()
                .success(true)
                .data(data)
                .pagination(metadata)
                .timestamp(LocalDateTime.now())
                .build();
    }
}