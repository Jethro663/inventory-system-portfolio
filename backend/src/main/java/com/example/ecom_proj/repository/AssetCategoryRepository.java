package com.example.ecom_proj.repository;

import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    AssetCategory findByName(String name);
}
