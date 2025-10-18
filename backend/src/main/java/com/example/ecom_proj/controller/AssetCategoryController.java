package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.dto.AssetCategoryDTO;
import com.example.ecom_proj.model.AssetCategory;
import com.example.ecom_proj.service.AssetCategoryService;
import com.example.ecom_proj.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/asset-categories")
@CrossOrigin
public class AssetCategoryController {

    private final AssetCategoryService service;
    private final FileStorageService fileStorageService;

    public AssetCategoryController(AssetCategoryService service, FileStorageService fileStorageService) {
        this.service = service;
        this.fileStorageService = fileStorageService;
    }

    /**
     * GET /asset-categories - Get all categories
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetCategoryDTO>>> getAllCategories() {
        List<AssetCategoryDTO> categories = service.getAllAssetCategories();
        return ResponseEntity.ok(
                ApiResponse.success("Categories retrieved successfully", categories)
        );
    }

    /**
     * GET /asset-categories/{id} - Get a single category by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetCategory>> getCategoryById(@PathVariable Long id) {
        AssetCategory category = service.getAssetCategoryById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Category retrieved successfully", category)
        );
    }

    /**
     * POST /asset-categories - Create a new category
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AssetCategory>> createCategory(
            @Valid @RequestBody AssetCategory category) {

        AssetCategory saved = service.createNewAssetCategory(category);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", saved));
    }

    @PostMapping(value = "/upload-icon", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<String>> uploadCategoryIcon(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.saveFile(file);
            return ResponseEntity.ok(ApiResponse.success("Icon uploaded successfully", "/uploads/" + fileName));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload icon: " + e.getMessage()));
        }
    }


    /**
     * PUT /asset-categories/{id} - Update an existing category
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetCategory>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody AssetCategory category) {

        category.setId(id);
        AssetCategory updated = service.updateAssetCategory(category);
        return ResponseEntity.ok(
                ApiResponse.success("Category updated successfully", updated)
        );
    }

    /**
     * DELETE /asset-categories/{id} - Delete a category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        service.deleteAssetCategory(id);
        return ResponseEntity.ok(
                ApiResponse.success("Category deleted successfully")
        );
    }
}