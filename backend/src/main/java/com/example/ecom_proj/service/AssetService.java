// FILE: src/main/java/com/example/ecom_proj/service/AssetService.java
package com.example.ecom_proj.service;

import com.example.ecom_proj.dto.BorrowedBy; // NOTE: DTO we created
import com.example.ecom_proj.dto.AssetSearchCriteria;
import com.example.ecom_proj.exceptions.AssetAlreadyExistsException;
import com.example.ecom_proj.exceptions.AssetNotFoundException;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.AssetTransaction;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.AssetRepository;
import com.example.ecom_proj.repository.AssetSpecification;
import com.example.ecom_proj.repository.AssetTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * AssetService — provides asset CRUD and search.

 */
@Service
public class AssetService {

    private static final Logger log = LoggerFactory.getLogger(AssetService.class);
    private final AssetRepository repository;
    private final AuditService auditService;
    private final AssetTransactionService assetTransactionService;
    private final AssetTransactionRepository transactionRepository;

    public AssetService(AssetRepository repository, AuditService auditService, AssetTransactionService assetTransactionService, AssetTransactionRepository transactionRepository) {
        this.repository = repository;
        this.auditService = auditService;
        this.assetTransactionService = assetTransactionService;
        this.transactionRepository = transactionRepository;
    }

    // -------------------------
    // Read operations (modified to include borrowedBy)
    // -------------------------
    public List<Asset> getAllAssets() {
        List<Asset> assets = repository.findAll();
        // Attach borrower info to each asset (if any)
        assets.forEach(this::attachBorrowerInfo);
        return assets;
    }

    public Asset getAssetById(Long id) {
        Asset asset = repository.findById(id).orElseThrow(() -> new AssetNotFoundException(id));
        attachBorrowerInfo(asset);
        return asset;
    }

    /**
     * Search with pagination. Existing search criteria code preserved; after resolving page,
     * attach borrower info to each content element.
     */
    public Page<Asset> searchAssets(AssetSearchCriteria criteria) {
        // Build specification and pageable (this mirrors earlier code in your codebase)
        Pageable pageable = buildPageable(criteria);
        Page<Asset> page = repository.findAll(AssetSpecification.withCriteria(criteria), pageable);

        // Attach borrower info to page content
        List<Asset> contentWithBorrower = page.getContent().stream()
                .peek(this::attachBorrowerInfo)
                .collect(Collectors.toList());

        return new PageImpl<>(contentWithBorrower, pageable, page.getTotalElements());
    }

    // -------------------------
    // Basic create/update/delete (unchanged logic except audit/transaction handling which the system already has)
    // These are provided for completeness; you may already have these in your codebase.
    // -------------------------
    @Transactional
    public Asset createAsset(Asset asset) {
        if (repository.findByName(asset.getName()) != null) {
            throw new AssetAlreadyExistsException(asset.getName());
        }
        if (repository.findBySerialNumber(asset.getSerialNumber()) != null) {
            throw new AssetAlreadyExistsException(
                    asset.getSerialNumber(),
                    repository.findBySerialNumber(asset.getSerialNumber()).getId()
            );
        }
        if (asset.getImageUrl() == null || asset.getImageUrl().isEmpty()) {
            throw new IllegalArgumentException("Asset image is required");
        }

        Asset saved = repository.save(asset);

        assetTransactionService.logTransaction(
                saved,
                AssetTransaction.TransactionAction.CREATE,
                LocalDateTime.now(),
                "Created new Asset " + saved.getName()
        );


        auditService.log("CREATE",
                saved.getName(),
                saved.getId(),
                asset.toString(),
                saved.toString()
        );
        return saved;
    }

    @Transactional
    public Asset updateAsset(Asset asset) {
        Asset existing = repository.findById(asset.getId())
                .orElseThrow(() -> new AssetNotFoundException(asset.getId()));

        Asset conflict = repository.findByName(asset.getName());
        if (conflict != null && !conflict.getId().equals(asset.getId())) {
            throw new AssetAlreadyExistsException(asset.getName());
        }

        String oldValue = existing.toString();

        // Update simple fields
        existing.setName(asset.getName());
        existing.setSerialNumber(asset.getSerialNumber());
        existing.setStatus(asset.getStatus());
        existing.setPurchaseDate(asset.getPurchaseDate());
        existing.setCost(asset.getCost());

        // Handle category carefully - don't replace the entire category object
        // Only update category if a valid one is provided with ID
        if (asset.getCategory() != null && asset.getCategory().getId() != null) {
            existing.setCategory(asset.getCategory());
        }
        // If category is null or doesn't have ID, keep the existing category

        Asset updated = repository.save(existing);

        AssetTransaction.TransactionAction actionEnum = getTransactionAction(updated);

        assetTransactionService.logTransaction(
                updated,
                actionEnum,
                LocalDateTime.now(),
                "Updated Asset " + updated.getName()
        );

        auditService.log("UPDATE",
                updated.getName(),
                updated.getId(),
                oldValue,
                updated.toString()
        );
        attachBorrowerInfo(updated);
        return updated;
    }

    @Transactional
    public void deleteAsset(Long id) {
        Asset existing = repository.findById(id)
                .orElseThrow(() -> new AssetNotFoundException(id));



        existing.setStatus(Asset.AssetStatus.RETIRED);

        AssetTransaction.TransactionAction actionEnum = getTransactionAction(existing);

        assetTransactionService.logTransaction(
                existing,
                actionEnum,          // pass the enum
                LocalDateTime.now(),
                "Archive Asset " + existing.getName()
        );


        auditService.log("ARCHIVE",
                existing.getName(),
                existing.getId(),
                existing.toString(),
                null
        );
    }
    @Transactional
    public void trueDeleteAsset(Long id) {
        Asset existing = repository.findById(id)
                .orElseThrow(() -> new AssetNotFoundException(id));

        AssetTransaction.TransactionAction actionEnum = getTransactionAction(existing);

        assetTransactionService.logTransaction(
                existing,
                actionEnum,          // pass the enum
                LocalDateTime.now(),
                "Delete Asset " + existing.getName()
        );

        repository.deleteById(id);

        auditService.log("DELETE",
                existing.getName(),
                existing.getId(),
                existing.toString(),
                null
        );
    }

    // -------------------------
    // Helper functions
    // -------------------------
    /**
     * Attach BorrowedBy DTO if this asset is IN_USE and a recent transaction indicates assignment.
     *
     * NOTE: This method uses the latest AssetTransaction (transactionDate desc). If the asset status
     * is IN_USE and the latest transaction's user exists, we set that user as the borrowedBy.
     *
     * Reasoning:
     * - avoids DB schema changes
     * - uses transaction logs as source-of-truth for "who got it last"
     *
     * If your workflow differs (e.g. you write explicit BORROW/RETURN actions), adapt the
     * action-checking logic below.
     */
    private void attachBorrowerInfo(Asset asset) {
        if (asset == null) return;

        // reset by default
        asset.setBorrowedBy(null);

        if (asset.getStatus() == null) return;

        // Only attempt to find a borrower if the asset is currently in use
        if (asset.getStatus() != Asset.AssetStatus.IN_USE) {
            return;
        }

        // Find last transaction for asset
        Optional<AssetTransaction> lastTxOpt = transactionRepository.findTopByAssetIdOrderByTransactionDateDesc(asset.getId());

        if (lastTxOpt.isEmpty()) {
            return;
        }

        AssetTransaction lastTx = lastTxOpt.get();
        if (lastTx.getUser() == null) {
            return;
        }

        // Decide which actions count as "assigned" — this is a reasonable default:
        // treat AVAILABLE and IN_USE transaction actions as assignment events.
        AssetTransaction.TransactionAction action = lastTx.getAction();
        boolean actionIndicatesAssigned = action == AssetTransaction.TransactionAction.IN_USE
                || action == AssetTransaction.TransactionAction.AVAILABLE
                || action == AssetTransaction.TransactionAction.CREATE; // fallback: create might mean initial assignment

        if (!actionIndicatesAssigned) {
            // If latest transaction is a maintenance/damaged/retire action, don't mark borrowedBy
            return;
        }

        // Build BorrowedBy DTO (Users may not have a fullName field; fall back to username)
        Users u = lastTx.getUser();


        // Build and set borrowedBy
        BorrowedBy borrowedBy = new BorrowedBy(u.getId(), u.getUsername());
        asset.setBorrowedBy(borrowedBy);
    }

    private static AssetTransaction.TransactionAction getTransactionAction(Asset updated) {
        Asset.AssetStatus assetStatus = updated.getStatus();

        // Map AssetStatus to TransactionAction
        AssetTransaction.TransactionAction actionEnum;
        switch (assetStatus) {
            case AVAILABLE -> actionEnum = AssetTransaction.TransactionAction.AVAILABLE;
            case IN_USE -> actionEnum = AssetTransaction.TransactionAction.IN_USE;
            case MAINTENANCE -> actionEnum = AssetTransaction.TransactionAction.MAINTENANCE;
            case DAMAGED -> actionEnum = AssetTransaction.TransactionAction.DAMAGED;
            case RETIRED -> actionEnum = AssetTransaction.TransactionAction.RETIRE;
            default -> actionEnum = AssetTransaction.TransactionAction.CREATE;
        }
        return actionEnum;
    }

    /**
     * Helper used when building pageable for search; preserves earlier behaviour.
     */
    private Pageable buildPageable(AssetSearchCriteria criteria) {
        int page = criteria.getPage() != null ? criteria.getPage() : 0;
        int size = criteria.getSize() != null ? criteria.getSize() : 10;

        // Default sorting
        Sort sort = Sort.by(Sort.Direction.DESC, "id");

        // Custom sorting if provided
        if (criteria.getSortBy() != null && !criteria.getSortBy().isBlank()) {
            Sort.Direction direction = "DESC".equalsIgnoreCase(criteria.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, criteria.getSortBy());
        }

        return PageRequest.of(page, size, sort);
    }
}
