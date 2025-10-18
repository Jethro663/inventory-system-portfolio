package com.example.ecom_proj.repository;

import com.example.ecom_proj.model.Audit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface AuditRepository extends JpaRepository<Audit, Long>, JpaSpecificationExecutor<Audit> {
    // find all audits by actor (username, id, etc.)
    List<Audit> findByPerformedBy(String performedBy);
    List<Audit> findByActionType(String action);

    List<Audit> findTop5ByOrderByPerformedAtDesc();
}
