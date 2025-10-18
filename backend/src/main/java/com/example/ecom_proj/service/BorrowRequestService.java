package com.example.ecom_proj.service;

import com.example.ecom_proj.model.*;
import com.example.ecom_proj.repository.AssetRepository;
import com.example.ecom_proj.repository.AssetTransactionRepository;
import com.example.ecom_proj.repository.BorrowRequestRepository;
import com.example.ecom_proj.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Business logic for borrow requests.
 *
 * Note: Uses transactional semantics when approving to ensure Asset state and Transaction row are created atomically.
 */
@Service
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AssetTransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository, AssetRepository assetRepository, UserRepository userRepository, AssetTransactionRepository transactionRepository, NotificationService notificationService, AuditService auditService) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    // BorrowRequestService.java

    public boolean hasExistingActiveOrPending(Long userId, Long assetId) {
        return borrowRequestRepository.existsActiveOrPendingByAssetAndRequester(assetId, userId);
    }

    public List<BorrowRequest> listRequestsByRequester(Users requester) {
        return borrowRequestRepository.findByRequester(requester);
    }

    @Transactional
    public boolean cancelRequestByRequester(Long requestId, Users requester) {
        return borrowRequestRepository.findById(requestId).map(br -> {
            if (br.getRequester() == null || !br.getRequester().getId().equals(requester.getId())) {
                return false; // not owner
            }
            if (br.getStatus() != BorrowRequest.Status.PENDING) {
                return false; // only pending can be cancelled
            }

            // Option A: set status to CANCELLED if your enum supports it.
            try {
                br.setStatus(BorrowRequest.Status.DECLINED); // or CANCELLED if you have it; using DECLINED as safe fallback
                br.setDeclineReason("Cancelled by requester");
                borrowRequestRepository.save(br);
                return true;
            } catch (Exception e) {
                // fallback to delete if desired:
                // borrowRequestRepository.delete(br);
                return false;
            }
        }).orElse(false);
    }
    @Transactional
    public boolean ReturnRequestByRequester(Long requestId, Users requester) {
        return borrowRequestRepository.findById(requestId).map(br -> {
            if (br.getRequester() == null || !br.getRequester().getId().equals(requester.getId())) {
                return false; // not owner
            }
            if (br.getStatus() != BorrowRequest.Status.APPROVED) {
                return false; // only pending can be cancelled
            }


            try {
                br.setStatus(BorrowRequest.Status.COMPLETE);
                br.setDeclineReason("Borrow Complete by requester");
                borrowRequestRepository.save(br);

                auditService.log("BORROW COMPLETE", // More descriptive action
                        "BorrowRequest", // Entity Name
                        requestId, // Entity ID
                        null, // Old Value
                        "User '" + requester.getUsername() + " Completed borrow asset" // New Value
                );

                Asset asset = br.getAsset();
                asset.setStatus(Asset.AssetStatus.AVAILABLE);
                assetRepository.save(asset); // persist status change

                // Create a transaction record using the requester as the user
                AssetTransaction tx = new AssetTransaction();
                tx.setAsset(asset);
                tx.setUser(br.getRequester());
                tx.setAction(AssetTransaction.TransactionAction.IN_USE);
                tx.setTransactionDate(LocalDateTime.now());
                tx.setNotes("Approved borrow request id: " + br.getId());
                transactionRepository.save(tx);
                return true;
            } catch (Exception e) {
                // fallback to delete if desired:
                // borrowRequestRepository.delete(br);
                return false;
            }
        }).orElse(false);
    }


    // -----------------------
    // Create request
    // -----------------------
    public BorrowRequest createRequest(Long requesterId, Long assetId, String note) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId)); // swap to your AssetNotFoundException if preferred

        Users requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found: " + requesterId));

        BorrowRequest br = new BorrowRequest();
        br.setAsset(asset);
        br.setRequester(requester);
        br.setNote(note);
        br.setStatus(BorrowRequest.Status.PENDING);
        br.setCreatedAt(LocalDateTime.now());

        BorrowRequest saved = borrowRequestRepository.save(br);



        auditService.log("BORROW REQUEST", // More descriptive action
                "BorrowRequest", // Entity Name
                saved.getId(), // Entity ID
                null, // Old Value
                "User '" + saved.getRequester().getUsername() + "' requested asset '" + saved.getAsset().getName() + "'" // New Value
        );

        // Notify all admins: simple approach — find admin users via repo (you might have roles)
        // We'll try to find users with role ADMIN using UserRepository. If none, skip notification.
        // NOTE: This assumes Users.role exists and UserRepository has a findByRole method — if not, fall back to sending to a single system user.
        try {
            List<Users> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase("ADMIN"))
                    .toList();

            String msg = "New borrow request (" + saved.getId() + ") for asset: " + asset.getName();

            for (Users admin : admins) {
                notificationService.createNotification(admin, msg);
            }
        } catch (Exception e) {
            // Don't fail if notification creation fails.
        }

        return saved;
    }

    // -----------------------
    // List pending requests for admin
    // -----------------------
    public List<BorrowRequest> listPendingRequestsForAdmin() {
        return borrowRequestRepository.findByStatus(BorrowRequest.Status.PENDING);
    }

    // -----------------------
    // Approve request (transactional)
    // -----------------------
    @Transactional
    public BorrowRequest approveRequest(Long requestId, Long adminId) {
        BorrowRequest req = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("BorrowRequest not found: " + requestId));

        if (req.getStatus() != BorrowRequest.Status.PENDING) {
            throw new RuntimeException("BorrowRequest is not pending");
        }

        Users admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found: " + adminId));

        // Set request as approved
        req.setStatus(BorrowRequest.Status.APPROVED);
        req.setProcessedBy(admin);
        req.setProcessedAt(LocalDateTime.now());
        BorrowRequest saved = borrowRequestRepository.save(req);

        // Update asset status -> IN_USE
        Asset asset = req.getAsset();
        asset.setStatus(Asset.AssetStatus.IN_USE);
        assetRepository.save(asset); // persist status change

        // Create a transaction record using the requester as the user
        AssetTransaction tx = new AssetTransaction();
        tx.setAsset(asset);
        tx.setUser(req.getRequester());
        tx.setAction(AssetTransaction.TransactionAction.IN_USE);
        tx.setTransactionDate(LocalDateTime.now());
        tx.setNotes("Approved borrow request id: " + req.getId());
        transactionRepository.save(tx);

        auditService.log("BORROW APPROVED",
                String.valueOf(req.getRequester().getUsername()),
                req.getId(),
                req.getProcessedBy().getUsername(),
                String.valueOf(saved.getProcessedAt())
        );

        // Notify requester
        String msg = "Your borrow request (" + req.getId() + ") for asset '" + asset.getName() + "' has been APPROVED.";
        try {
            notificationService.createNotification(req.getRequester(), msg);
        } catch (Exception ignore) {}

        return saved;
    }

    // -----------------------
    // Decline request
    // -----------------------
    @Transactional
    public BorrowRequest declineRequest(Long requestId, Long adminId, String reason) {
        BorrowRequest req = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("BorrowRequest not found: " + requestId));

        if (req.getStatus() != BorrowRequest.Status.PENDING) {
            throw new RuntimeException("BorrowRequest is not pending");
        }

        Users admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found: " + adminId));

        req.setStatus(BorrowRequest.Status.DECLINED);
        req.setProcessedBy(admin);
        req.setProcessedAt(LocalDateTime.now());
        req.setDeclineReason(reason);
        BorrowRequest saved = borrowRequestRepository.save(req);


        auditService.log("BORROW DECLINED",
                String.valueOf(req.getRequester().getUsername()),
                req.getId(),
                req.getProcessedBy().getUsername(),
                String.valueOf(saved.getProcessedAt())
        );

        // Notify requester
        String msg = "Your borrow request (" + req.getId() + ") for asset '" + req.getAsset().getName() + "' has been DECLINED."
                + (reason != null ? " Reason: " + reason : "");
        try {
            notificationService.createNotification(req.getRequester(), msg);
        } catch (Exception ignore) {}

        return saved;
    }
}
