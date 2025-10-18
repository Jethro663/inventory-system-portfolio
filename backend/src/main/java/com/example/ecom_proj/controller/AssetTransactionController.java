package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.dto.AssetTransactionSearchCriteria;
import com.example.ecom_proj.dto.PageResponse;
import com.example.ecom_proj.exceptions.AssetNotFoundException;
import com.example.ecom_proj.exceptions.UserNotFoundException;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.AssetTransaction;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.AssetRepository;
import com.example.ecom_proj.repository.UserRepository;
import com.example.ecom_proj.service.AssetTransactionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/asset-transactions")
public class AssetTransactionController {

    private final AssetTransactionService service;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;

    public AssetTransactionController(AssetTransactionService service, UserRepository userRepository, AssetRepository assetRepository) {
        this.service = service;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetTransaction>>> getAllAssets() {
        return ResponseEntity.ok(
                ApiResponse.success("Assets Transactions retrieved successfully", service.getAllAssetTransaction())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetTransaction>> getAssetTransactionById(@PathVariable Long id) {
        AssetTransaction transaction = service.getAssetTransactionById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asset transaction retrieved successfully", transaction)
        );
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<List<AssetTransaction>>> getTransactionsByAsset(@PathVariable Long assetId) {
        List<AssetTransaction> transactions = service.getTransactionsByAsset(assetId);
        return ResponseEntity.ok(
                ApiResponse.success("Transactions for asset retrieved successfully", transactions)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AssetTransaction>>> getTransactionsByUser(@PathVariable Long userId) {
        List<AssetTransaction> transactions = service.getTransactionsByUser(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Transactions for user retrieved successfully", transactions)
        );
    }


    @PostMapping
    public ResponseEntity<ApiResponse<String>> createTransaction(
            @RequestParam Long assetId,
            @RequestParam Long userId,
            @RequestParam AssetTransaction.TransactionAction action,
            @RequestParam(required = false) String notes
    ) {
        try {
            Asset asset = assetRepository.findById(assetId)
                    .orElseThrow(() -> new AssetNotFoundException(assetId));

            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));





            service.logTransaction(asset,  action, LocalDateTime.now(), notes);


            return ResponseEntity.ok(ApiResponse.success("Transaction logged successfully"));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to log transaction: " + e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        service.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Asset transaction deleted successfully", null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetTransaction>> updateTransaction(
            @PathVariable Long id,
            @RequestBody AssetTransaction updated
    ) {
        AssetTransaction transaction = service.updateTransaction(id, updated);
        return ResponseEntity.ok(ApiResponse.success("Transaction updated successfully", transaction));
    }






    @GetMapping("/search")
    public ResponseEntity<PageResponse<AssetTransaction>> searchAssetTransactions(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String assetName,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) AssetTransaction.TransactionAction action,
            @RequestParam(required = false) LocalDate transactionDateFrom,
            @RequestParam(required = false) LocalDate transactionDateTo,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        AssetTransactionSearchCriteria criteria = AssetTransactionSearchCriteria.builder()
                .searchTerm(searchTerm)
                .assetName(assetName)
                .userName(username)
                .action(action)
                .notes(notes)
                .transactionDateFrom(transactionDateFrom)
                .transactionDateTo(transactionDateTo)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .build();

        Page<AssetTransaction> transactionPage = service.searchAssetsTransaction(criteria);

        PageResponse.PageMetadata metadata = PageResponse.PageMetadata.builder()
                .currentPage(transactionPage.getNumber())
                .pageSize(transactionPage.getSize())
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .first(transactionPage.isFirst())
                .last(transactionPage.isLast())
                .build();

        PageResponse<AssetTransaction> response = PageResponse.of(transactionPage.getContent(), metadata);
        response.setSuccess(true);
        response.setMessage("Asset transactions retrieved successfully");

        return ResponseEntity.ok(response);
    }


}
