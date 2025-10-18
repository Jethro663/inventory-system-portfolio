package com.example.ecom_proj.repository;

import com.example.ecom_proj.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    Asset findByName(String name);
    Asset findBySerialNumber(String serialNumber);

    // Keep existing queries for backward compatibility
    @Query("SELECT a FROM Asset a WHERE str(a.id) LIKE %:idPart%")
    List<Asset> searchByIdLike(@Param("idPart") String idPart);

    @Query("SELECT a FROM Asset a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :namePart, '%'))")
    List<Asset> searchByNameLike(@Param("namePart") String namePart);

    @Query("SELECT a FROM Asset a WHERE LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :serialPart, '%'))")
    List<Asset> searchBySerialLike(@Param("serialPart") String serialPart);

    @Query("SELECT a FROM Asset a WHERE LOWER(a.category.name) LIKE LOWER(CONCAT('%', :categoryPart, '%'))")
    List<Asset> searchByCategoryLike(@Param("categoryPart") String categoryPart);

    @Query("SELECT a FROM Asset a WHERE LOWER(a.status) = LOWER(:status)")
    List<Asset> searchByStatus(@Param("status") String status);

    List<Asset> findByPurchaseDate(LocalDate purchaseDate);
    List<Asset> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);
    List<Asset> findByCost(Double cost);
    List<Asset> findByCostBetween(Double min, Double max);

    // Count assets by category ID
    long countByCategoryId(Long categoryId);

    // Optional: fetch all assets by category
    List<Asset> findByCategoryId(Long categoryId);

}