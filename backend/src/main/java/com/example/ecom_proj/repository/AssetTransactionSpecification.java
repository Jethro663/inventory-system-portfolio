package com.example.ecom_proj.repository;

import com.example.ecom_proj.dto.AssetTransactionSearchCriteria;
import com.example.ecom_proj.model.AssetTransaction;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.Users;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification for dynamic AuditTransaction queries.
 * Builds flexible WHERE clauses based on AuditTransactionSearchCriteria.
 */
public class AssetTransactionSpecification {

    /**
     * Build a specification from search criteria
     */
    public static Specification<AssetTransaction> withCriteria(AssetTransactionSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Global search term — searches across asset name and user username
            if (criteria.getSearchTerm() != null && !criteria.getSearchTerm().isBlank()) {
                String pattern = "%" + criteria.getSearchTerm().toLowerCase() + "%";

                Join<AssetTransaction, Asset> assetJoin = root.join("asset");
                Join<AssetTransaction, Users> userJoin = root.join("user");

                Predicate assetNamePredicate = cb.like(cb.lower(assetJoin.get("name")), pattern);
                Predicate userNamePredicate = cb.like(cb.lower(userJoin.get("username")), pattern);

                predicates.add(cb.or(assetNamePredicate, userNamePredicate));
            }

            // Filter by specific asset name
            if (criteria.getAssetName() != null && !criteria.getAssetName().isBlank()) {
                Join<AssetTransaction, Asset> assetJoin = root.join("asset");
                predicates.add(cb.like(
                        cb.lower(assetJoin.get("name")),
                        "%" + criteria.getAssetName().toLowerCase() + "%"
                ));
            }

            // Filter by specific user name
            if (criteria.getUserName() != null && !criteria.getUserName().isBlank()) {
                Join<AssetTransaction, Users> userJoin = root.join("user");
                predicates.add(cb.like(
                        cb.lower(userJoin.get("username")),
                        "%" + criteria.getUserName().toLowerCase() + "%"
                ));
            }

            // Filter by transaction action (enum)
            if (criteria.getAction() != null) {
                predicates.add(cb.equal(root.get("action"), criteria.getAction()));
            }

            if (criteria.getNotes() != null && !criteria.getNotes().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("notes")),
                        "%" + criteria.getNotes().toLowerCase() + "%"
                ));
            }
            // Date range filters — convert LocalDate to LocalDateTime for comparison
            if (criteria.getTransactionDateFrom() != null) {
                LocalDateTime fromDateTime = criteria.getTransactionDateFrom().atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), fromDateTime));
            }

            if (criteria.getTransactionDateTo()  != null) {
                LocalDateTime toDateTime = criteria.getTransactionDateTo().atTime(LocalTime.MAX);
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), toDateTime));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
