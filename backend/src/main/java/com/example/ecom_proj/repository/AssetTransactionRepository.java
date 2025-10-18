package com.example.ecom_proj.repository;


import com.example.ecom_proj.model.AssetTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface AssetTransactionRepository extends JpaRepository<AssetTransaction, Long>, JpaSpecificationExecutor<AssetTransaction> {
    List<AssetTransaction> findByAssetId(Long assetId);
    List<AssetTransaction> findByUserId(Long userId);
    Optional<AssetTransaction> findTopByAssetIdOrderByTransactionDateDesc(Long assetId);
}
