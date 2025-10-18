package com.example.ecom_proj.repository;

import com.example.ecom_proj.dto.AssetSearchCriteria;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.AssetCategory;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification for dynamic Asset queries
 * Allows building complex WHERE clauses programmatically
 */
public class AssetSpecification {

    /**
     * Build a specification from search criteria
     */
    public static Specification<Asset> withCriteria(AssetSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Global search term - searches across multiple fields
            if (criteria.getSearchTerm() != null && !criteria.getSearchTerm().isBlank()) {
                String searchPattern = "%" + criteria.getSearchTerm().toLowerCase() + "%";

                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        searchPattern
                );
                Predicate serialPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("serialNumber")),
                        searchPattern
                );

                // Search in category name too
                Join<Asset, AssetCategory> categoryJoin = root.join("category");
                Predicate categoryPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(categoryJoin.get("name")),
                        searchPattern
                );

                predicates.add(criteriaBuilder.or(namePredicate, serialPredicate, categoryPredicate));
            }

            // Specific field filters
            if (criteria.getName() != null && !criteria.getName().isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + criteria.getName().toLowerCase() + "%"
                ));
            }

            if (criteria.getSerialNumber() != null && !criteria.getSerialNumber().isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("serialNumber")),
                        "%" + criteria.getSerialNumber().toLowerCase() + "%"
                ));
            }

            if (criteria.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), criteria.getStatus()));
            }

            if (criteria.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), criteria.getCategoryId()));
            }

            if (criteria.getCategoryName() != null && !criteria.getCategoryName().isBlank()) {
                Join<Asset, AssetCategory> categoryJoin = root.join("category");
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(categoryJoin.get("name")),
                        "%" + criteria.getCategoryName().toLowerCase() + "%"
                ));
            }

            // Date range filters
            if (criteria.getPurchaseDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("purchaseDate"),
                        criteria.getPurchaseDateFrom()
                ));
            }

            if (criteria.getPurchaseDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("purchaseDate"),
                        criteria.getPurchaseDateTo()
                ));
            }

            // Cost range filters
            if (criteria.getMinCost() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("cost"),
                        criteria.getMinCost()
                ));
            }

            if (criteria.getMaxCost() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("cost"),
                        criteria.getMaxCost()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}