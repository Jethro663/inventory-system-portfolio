package com.example.ecom_proj.service;

import com.example.ecom_proj.dto.AssetCategoryDTO;
import com.example.ecom_proj.exceptions.AssetCategoryAlreadyExistsException;
import com.example.ecom_proj.exceptions.AssetCategoryNotFoundException;
import com.example.ecom_proj.model.AssetCategory;
import com.example.ecom_proj.repository.AssetCategoryRepository;
import com.example.ecom_proj.repository.AssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetCategoryService {

    private final AssetCategoryRepository repository;
    private final AuditService auditService;
    private final AssetRepository assetRepository;

    public AssetCategoryService(AssetCategoryRepository repository, AuditService auditService, AssetRepository assetRepository) {
        this.repository = repository;
        this.auditService = auditService;
        this.assetRepository = assetRepository;
    }

    public List<AssetCategoryDTO> getAllAssetCategories() {
        return repository.findAll().stream()
                .map(cat -> {
                    long count = assetRepository.countByCategoryId(cat.getId()); // <-- returns actual count
                    return new AssetCategoryDTO(cat, (int) count); // cast to int if you want

                })
                .collect(Collectors.toList());
    }




    @Transactional
    public AssetCategory createNewAssetCategory(AssetCategory category) {
        if(repository.findByName(category.getName()) != null) {
            throw new AssetCategoryAlreadyExistsException(category.getName());
        }
        AssetCategory saved = repository.save(category);

        auditService.log("CREATE",
                saved.getName(),
                saved.getId(),
                saved.toString(),
                saved.toString()
        );



        return saved;
    }

     public AssetCategory getAssetCategoryById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new AssetCategoryNotFoundException(id));
    }

    @Transactional
    public AssetCategory updateAssetCategory(AssetCategory category) {
        AssetCategory existing = repository.findById(category.getId())
                .orElseThrow(() -> new AssetCategoryNotFoundException(category.getId()));

        AssetCategory conflict = repository.findByName(category.getName());
        if(conflict != null && !conflict.getId().equals(category.getId())) {
            throw new AssetCategoryAlreadyExistsException(category.getName());
        }

        String oldValue = existing.toString();

        existing.setName(category.getName());
        existing.setDescription(category.getDescription());

        if (category.getIconUrl() == null) {
            category.setIconUrl("/uploads/default-icon.png");
        }

        AssetCategory saved = repository.save(existing);

        auditService.log("UPDATE",
                saved.getName(),
                saved.getId(),
                existing.toString(),
                saved.toString()
        );





        return saved;
    }

    @Transactional
    public void deleteAssetCategory(Long id) {
        AssetCategory existing = repository.findById(id)
                .orElseThrow(() -> new AssetCategoryNotFoundException(id));

        // Prevent deletion if category has assets
        if (existing.getAssets() != null && !existing.getAssets().isEmpty()) {
            throw new IllegalStateException(
                    "Cannot delete category with existing assets. " +
                            "Please reassign or delete " + existing.getAssets().size() + " asset(s) first."
            );
        }

        repository.deleteById(id);


        auditService.log("DELETE",
                existing.getName(),
                existing.getId(),
                existing.toString(),
                null
        );


    }


}
