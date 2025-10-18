package com.example.ecom_proj.controller;


import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.dto.AuditSearchCriteria;
import com.example.ecom_proj.dto.PageResponse;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.Audit;
import com.example.ecom_proj.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/audits")
@CrossOrigin
public class AuditController {

    private final AuditService service;

    public AuditController(AuditService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Audit>>> getAllAssets() {
        return ResponseEntity.ok(
                ApiResponse.success("Audit retrieved successfully", service.getAllAudit())
        );
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<Audit>> searchAudits(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String performedBy,
            @RequestParam(required = false) LocalDate performedDateFrom,
            @RequestParam(required = false) LocalDate performedDateTo,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        // 🔹 Build criteria object
        AuditSearchCriteria criteria = AuditSearchCriteria.builder()
                .searchTerm(searchTerm)
                .entityName(entityName)
                .entityId(entityId)
                .actionType(actionType)
                .performedBy(performedBy)
                .performedDateFrom(performedDateFrom)
                .performedDateTo(performedDateTo)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .build();

        // 🔹 Call service
        Page<Audit> auditPage = service.searchAudits(criteria);

        // 🔹 Build metadata
        PageResponse.PageMetadata metadata = PageResponse.PageMetadata.builder()
                .currentPage(auditPage.getNumber())
                .pageSize(auditPage.getSize())
                .totalElements(auditPage.getTotalElements())
                .totalPages(auditPage.getTotalPages())
                .first(auditPage.isFirst())
                .last(auditPage.isLast())
                .build();

        // 🔹 Build response
        PageResponse<Audit> response = PageResponse.of(auditPage.getContent(), metadata);
        response.setSuccess(true);
        response.setMessage("Audits retrieved successfully");

        return ResponseEntity.ok(response);
    }



    //Continue

    @GetMapping("/filter/performedBy/{performer}")
    public ResponseEntity<ApiResponse<List<Audit>>> getAssetsByStatus(
            @PathVariable String performer) {
        return ResponseEntity.ok(
                ApiResponse.success("Audit filtered by Performer", service.findByActor(performer))
        );
    }
}
