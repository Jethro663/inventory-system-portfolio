package com.example.ecom_proj.service;


import com.example.ecom_proj.dto.AssetTransactionSearchCriteria;
import com.example.ecom_proj.exceptions.AssetNotFoundException;
import com.example.ecom_proj.exceptions.AssetTransactionNotFoundException;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.AssetTransaction;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.AssetTransactionRepository;
import com.example.ecom_proj.repository.AssetTransactionSpecification;
import com.example.ecom_proj.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssetTransactionService {

    private static final Logger log = LoggerFactory.getLogger(AssetTransactionService.class);
    private final AssetTransactionRepository repository;
    private final AuditService auditService;
    private final UserRepository userRepository;

    public AssetTransactionService(AssetTransactionRepository repository, AuditService auditService, UserRepository userRepository) {
        this.repository = repository;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    public List<AssetTransaction> getAllAssetTransaction() {return repository.findAll();}

    public AssetTransaction getAssetTransactionById(Long id) {
        return repository.findById(id).orElseThrow(() -> new AssetTransactionNotFoundException(id));
    }

    /**
     * Get all transactions linked to a specific asset
     */
    public List<AssetTransaction> getTransactionsByAsset(Long assetId) {
        return repository.findByAssetId(assetId);
    }

    /**
     * Get all transactions performed by a specific user
     */
    public List<AssetTransaction> getTransactionsByUser(Long userId) {
        return repository.findByUserId(userId);
    }



    @Transactional
    public void logTransaction(
            Asset asset,
            AssetTransaction.TransactionAction action,
            LocalDateTime transactionDate,
            String notes
    ) {
        try {
            // Get the currently authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                throw new RuntimeException("No authenticated user found");
            }

            String username = auth.getName(); // this is the logged-in username

            Users user = userRepository.findByUsername(username);
            if (user == null) {
                throw new RuntimeException("User not found: " + username);
            }



            AssetTransaction transaction = AssetTransaction.builder()
                    .asset(asset)
                    .user(user)
                    .action(action)
                    .transactionDate(transactionDate)
                    .notes(notes)
                    .build();

            AssetTransaction saved = repository.save(transaction);


            auditService.log(
                    action.name(), // e.g., "MAINTENANCE"
                    "AssetTransaction", // Entity name
                    saved.getId(), // Entity ID
                    null, // Old value
                    "Transaction: " + action.name() + " for asset: " + asset.getName() // New value
            );


        } catch (Exception e) {
            log.error("Failed to write Transaction log", e);
            throw new RuntimeException("Transaction logging failed", e);
        }
    }


    //Create Search

    /**
     * Search/Filter assets transaction with pagination
     */
    public Page<AssetTransaction> searchAssetsTransaction(AssetTransactionSearchCriteria criteria) {
        // Build specification from criteria
        Specification<AssetTransaction> spec = AssetTransactionSpecification.withCriteria(criteria);

        // Build pageable with sorting
        Pageable pageable = buildPageable(criteria);

        return repository.findAll(spec, pageable);
    }


    private Pageable buildPageable(AssetTransactionSearchCriteria criteria) {
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


    public void deleteTransaction(Long id) {
        AssetTransaction existing = repository.findById(id)
                .orElseThrow(() -> new AssetTransactionNotFoundException(id));

        repository.deleteById(id);
        auditService.log("DELETE",
                existing.getNotes(),
                existing.getId(),
                existing.toString(),
                null
        );

    }




    @Transactional
    public AssetTransaction updateTransaction(Long id, AssetTransaction updated) {
        // Fetch existing transaction or throw an exception if not found
        AssetTransaction existing = repository.findById(id)
                .orElseThrow(() -> new AssetTransactionNotFoundException(id));

        // Update allowed fields only (never overwrite the entire object blindly)
        if (updated.getAction() != null) {
            existing.setAction(updated.getAction());
        }
        if (updated.getNotes() != null) {
            existing.setNotes(updated.getNotes());
        }
        if (updated.getTransactionDate() != null) {
            existing.setTransactionDate(updated.getTransactionDate());
        }
        if (updated.getAsset() != null) {
            existing.setAsset(updated.getAsset());
        }
        if (updated.getUser() != null) {
            existing.setUser(updated.getUser());
        }

        // Save the updated entity
        AssetTransaction saved = repository.save(existing);

        repository.deleteById(id);
        auditService.log("DELETE",
                saved.getNotes(),
                saved.getId(),
                existing.toString(),
                saved.toString()
        );


        return saved;
    }

}
