package com.example.ecom_proj.service;

import com.example.ecom_proj.model.AssetTransaction;
import com.example.ecom_proj.repository.AssetRepository;
import com.example.ecom_proj.repository.AssetTransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final AssetRepository assetRepo;
    private final AssetTransactionRepository txnRepo;

    public ReportService(AssetRepository assetRepo, AssetTransactionRepository txnRepo) {
        this.assetRepo = assetRepo;
        this.txnRepo = txnRepo;
    }

    public Map<String, Long> getAssetSummary() {
        return assetRepo.findAll().stream()
                .collect(Collectors.groupingBy(a -> a.getCategory().getName(), Collectors.counting()));
    }

    public List<AssetTransaction> getRecentTransactions() {
        Pageable top10 = PageRequest.of(0, 10, Sort.by("transactionDate").descending());
        return txnRepo.findAll(top10).getContent();
    }
}

