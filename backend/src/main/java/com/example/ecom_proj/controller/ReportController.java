package com.example.ecom_proj.controller;


import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.repository.AssetRepository;
import com.example.ecom_proj.repository.AssetTransactionRepository;
import com.example.ecom_proj.repository.AuditRepository;
import com.example.ecom_proj.repository.UserRepository;
import com.example.ecom_proj.service.ReportService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/reports")
public class ReportController {

    private final ReportService service;
    private final AssetRepository assetRepo;
    private final UserRepository userRepo;
    private final AssetTransactionRepository txnRepo;
    private final AuditRepository auditRepo;

    public ReportController(ReportService service,
                            AssetRepository assetRepo,
                            UserRepository userRepo,
                            AssetTransactionRepository txnRepo,
                            AuditRepository auditRepo) {
        this.service = service;
        this.assetRepo = assetRepo;
        this.userRepo = userRepo;
        this.txnRepo = txnRepo;
        this.auditRepo = auditRepo;
    }

    @GetMapping("/asset-summary")
    public ApiResponse<?> getAssetSummary() {
        return ApiResponse.success(service.getAssetSummary());
    }

    @GetMapping("/transactions/recent")
    public ApiResponse<?> getRecentTransactions() {
        return ApiResponse.success(service.getRecentTransactions());
    }

    @GetMapping("/dashboard")
    public ApiResponse<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAssets", assetRepo.count());
        stats.put("totalUsers", userRepo.count());
        stats.put("totalTransactions", txnRepo.count());
        stats.put("recentAudits", auditRepo.findTop5ByOrderByPerformedAtDesc());
        return ApiResponse.success(stats);
    }



}
