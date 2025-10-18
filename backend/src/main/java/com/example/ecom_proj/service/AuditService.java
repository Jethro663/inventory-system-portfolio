package com.example.ecom_proj.service;

import com.example.ecom_proj.dto.AuditSearchCriteria;
import com.example.ecom_proj.model.Audit;
import com.example.ecom_proj.repository.AuditRepository;
import com.example.ecom_proj.repository.AuditSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditRepository repository;

    public AuditService(AuditRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void log(
            String action,
            String entityName,
            Long entityId,
            String oldValue,
            String newValue
    ) {
        try {
            // Get the currently authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String performedBy = (auth != null && auth.isAuthenticated())
                    ? auth.getName()
                    : "UNKNOWN";

            // Make sure entityName is not null or empty
            if (entityName == null || entityName.trim().isEmpty()) {
                entityName = "Unknown Entity"; // Provide a default value
            }

            Audit audit = Audit.builder()
                    .performedBy(performedBy)
                    .actionType(action)
                    .entityName(truncate(entityName, 100)) // This must not be null/empty
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .performedAt(LocalDateTime.now())
                    .build();

            repository.save(audit);
        } catch (Exception e) {
            log.error("Failed to write audit log", e);
        }
    }

    private String truncate(String val, int maxLen) {
        if (val == null) return null;
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }

    public Page<Audit> searchAudits(AuditSearchCriteria criteria) {
        // Build specification from criteria
        Specification<Audit> spec = AuditSpecification.withCriteria(criteria);

        // Build pageable with sorting
        Pageable pageable = buildPageable(criteria);

        return repository.findAll(spec, pageable);
    }



    public List<Audit> getAllAudit() {
        return repository.findAll();
    }

    public List<Audit> findByActor(String performer) {
        return repository.findByPerformedBy(performer);
    }
    public List<Audit> findByAction(String action) {
        return repository.findByActionType(action);
    }

    /**
     * Helper method to build Pageable with sorting
     */
    private Pageable buildPageable(AuditSearchCriteria criteria) {
        int page = criteria.getPage() != null ? criteria.getPage() : 0;
        int size = criteria.getSize() != null ? criteria.getSize() : 10;

        // Default sorting
        Sort sort = Sort.by(Sort.Direction.DESC, "id");

        // Custom sorting if provided
        if (criteria.getSortBy() != null && !criteria.getSortBy().isBlank()) {
            Sort.Direction direction = "DESC".equalsIgnoreCase(criteria.getSortDirection())
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            sort = Sort.by(direction, criteria.getSortBy());
        }

        return PageRequest.of(page, size, sort);
    }






}
