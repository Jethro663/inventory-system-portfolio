package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.dto.AssetSearchCriteria;
import com.example.ecom_proj.dto.PageResponse;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.service.AssetService;
import com.example.ecom_proj.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/assets")
@CrossOrigin
public class AssetController {

    private final AssetService service;
    private final FileStorageService fileStorageService;


    public AssetController(AssetService service, FileStorageService fileStorageService) {
        this.service = service;
        this.fileStorageService = fileStorageService;
    }

    /**
     * GET /assets - Get all assets (simple list - no pagination)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Asset>>> getAllAssets() {
        return ResponseEntity.ok(
                ApiResponse.success("Assets retrieved successfully", service.getAllAssets())
        );
    }

    /**
     * GET /assets/search - Advanced search with filters and pagination
     *
     * Query Parameters:
     *   - searchTerm: Global search across name, serial, category
     *   - name: Filter by name (partial match)
     *   - serialNumber: Filter by serial number
     *   - status: Filter by status (AVAILABLE, IN_USE, MAINTENANCE, etc.)
     *   - categoryId: Filter by category ID
     *   - categoryName: Filter by category name
     *   - purchaseDateFrom: Filter by purchase date (from)
     *   - purchaseDateTo: Filter by purchase date (to)
     *   - minCost: Minimum cost
     *   - maxCost: Maximum cost
     *   - sortBy: Field to sort by (name, cost, purchaseDate, etc.)
     *   - sortDirection: ASC or DESC
     *   - page: Page number (0-based)
     *   - size: Page size (default: 10)
     *
     * Examples:
     *   GET /assets/search?searchTerm=laptop
     *   GET /assets/search?status=AVAILABLE&page=0&size=20
     *   GET /assets/search?minCost=1000&maxCost=5000&sortBy=cost&sortDirection=ASC
     *   GET /assets/search?categoryName=Electronics&status=IN_USE
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<Asset>> searchAssets(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) Asset.AssetStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) LocalDate purchaseDateFrom,
            @RequestParam(required = false) LocalDate purchaseDateTo,
            @RequestParam(required = false) Double minCost,
            @RequestParam(required = false) Double maxCost,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        AssetSearchCriteria criteria = AssetSearchCriteria.builder()
                .searchTerm(searchTerm)
                .name(name)
                .serialNumber(serialNumber)
                .status(status)
                .categoryId(categoryId)
                .categoryName(categoryName)
                .purchaseDateFrom(purchaseDateFrom)
                .purchaseDateTo(purchaseDateTo)
                .minCost(minCost)
                .maxCost(maxCost)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .build();

        Page<Asset> assetPage = service.searchAssets(criteria);

        PageResponse.PageMetadata metadata = PageResponse.PageMetadata.builder()
                .currentPage(assetPage.getNumber())
                .pageSize(assetPage.getSize())
                .totalElements(assetPage.getTotalElements())
                .totalPages(assetPage.getTotalPages())
                .first(assetPage.isFirst())
                .last(assetPage.isLast())
                .build();

        PageResponse<Asset> response = PageResponse.of(assetPage.getContent(), metadata);
        response.setSuccess(true);
        response.setMessage("Assets retrieved successfully");

        return ResponseEntity.ok(response);
    }










    /**
     * GET /assets/{id} - Get a single asset by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> getAssetById(@PathVariable Long id) {
        Asset asset = service.getAssetById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asset retrieved successfully", asset)
        );
    }

    /**
     * POST /assets - Create a new asset
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Asset>> createAsset(@Valid @RequestBody Asset asset) {
        Asset saved = service.createAsset(asset);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset created successfully", saved));
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<String>> uploadAssetImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.saveFile(file); // helper method
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", "/uploads/" + fileName));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }


    /**
     * PUT /assets/{id} - Update an existing asset
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody Asset asset) {

        asset.setId(id);
        Asset updated = service.updateAsset(asset);
        return ResponseEntity.ok(
                ApiResponse.success("Asset updated successfully", updated)
        );
    }

    @PutMapping("/{id}/borrow")
    public ResponseEntity<ApiResponse<Asset>> borrowAsset(
            @PathVariable Long id,
            @Valid @RequestBody Asset asset) {

        asset.setStatus(Asset.AssetStatus.IN_USE);
        Asset updated = service.updateAsset(asset);
        return ResponseEntity.ok(
                ApiResponse.success("Asset updated successfully", updated)
        );
    }

    /**
     * DELETE /assets/{id} - Delete an asset
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> retireAsset(@PathVariable Long id) {
        service.deleteAsset(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asset Retired successfully")
        );
    }
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(@PathVariable Long id) {
        service.trueDeleteAsset(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asset Deleted successfully")
        );
    }
}