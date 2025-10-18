package com.example.ecom_proj.repository;

import com.example.ecom_proj.model.BorrowRequest;
import com.example.ecom_proj.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    @Query("SELECT br FROM BorrowRequest br " +
            "JOIN FETCH br.asset a " +
            "JOIN FETCH br.requester r " +
            "WHERE br.status = :status")
    List<BorrowRequest> findByStatus(@Param("status") BorrowRequest.Status status);

    // BorrowRequestRepository.java

    @Query("SELECT COUNT(br) > 0 FROM BorrowRequest br " +
            "WHERE br.asset.id = :assetId " +
            "AND br.requester.id = :userId " +
            "AND br.status IN ('PENDING', 'APPROVED')")
    boolean existsActiveOrPendingByAssetAndRequester(@Param("assetId") Long assetId, @Param("userId") Long userId);



    // NOTE: Find requests by requester
    List<BorrowRequest> findByRequester(Users requester);
}
