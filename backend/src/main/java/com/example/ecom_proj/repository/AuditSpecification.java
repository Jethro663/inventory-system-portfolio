package com.example.ecom_proj.repository;

import com.example.ecom_proj.dto.AuditSearchCriteria;
import com.example.ecom_proj.model.Audit;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification for dynamic Audit queries
 * Allows building complex WHERE clauses programmatically
 */
public class AuditSpecification {

    /**
     * Build a specification from search criteria
     */
    public static Specification<Audit> withCriteria(AuditSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 🔹 Global search term - searches across multiple fields
            if (criteria.getSearchTerm() != null && !criteria.getSearchTerm().isBlank()) {
                String searchPattern = "%" + criteria.getSearchTerm().toLowerCase() + "%";

                Predicate entityNamePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("entityName")),
                        searchPattern
                );

                Predicate actionTypePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("actionType")),
                        searchPattern
                );

                Predicate performedByPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("performedBy")),
                        searchPattern
                );

                predicates.add(criteriaBuilder.or(entityNamePredicate, actionTypePredicate, performedByPredicate));
            }

            // 🔹 Specific field filters
            if (criteria.getEntityName() != null && !criteria.getEntityName().isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("entityName")),
                        "%" + criteria.getEntityName().toLowerCase() + "%"
                ));
            }

            if (criteria.getEntityId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("entityId"), criteria.getEntityId()));
            }

            if (criteria.getActionType() != null && !criteria.getActionType().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("actionType"), criteria.getActionType()));
            }

            if (criteria.getPerformedBy() != null && !criteria.getPerformedBy().isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("performedBy")),
                        "%" + criteria.getPerformedBy().toLowerCase() + "%"
                ));
            }

            // 🔹 Date range filters
            if (criteria.getPerformedDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("performedDate"),
                        criteria.getPerformedDateFrom()
                ));
            }

            if (criteria.getPerformedDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("performedDate"),
                        criteria.getPerformedDateTo()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
