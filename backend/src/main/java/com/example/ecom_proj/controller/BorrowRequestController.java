package com.example.ecom_proj.controller;

import com.example.ecom_proj.dto.ApiResponse;
import com.example.ecom_proj.dto.BorrowRequestDTO;
import com.example.ecom_proj.model.BorrowRequest;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.UserRepository;
import com.example.ecom_proj.service.BorrowRequestService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for borrow requests.
 *
 * Endpoints:
 * - POST /api/borrow-requests           (create)
 * - GET  /api/borrow-requests?status=   (list; status optional)
 * - PUT  /api/borrow-requests/{id}/approve?adminId=...
 * - PUT  /api/borrow-requests/{id}/decline?adminId=...&reason=...
 */
@RestController
@CrossOrigin
@RequestMapping("/borrow-requests")
public class BorrowRequestController {

    private final BorrowRequestService service;
    private final UserRepository userRepository;

    public BorrowRequestController(BorrowRequestService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BorrowRequestDTO>>> getMyRequests(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User not found"));
        }

        // NOTE: service returns domain objects; map to DTOs that include asset name and processedBy username
        List<BorrowRequest> results = service.listRequestsByRequester(user);
        List<BorrowRequestDTO> dto = results.stream()
                .map(BorrowRequestDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("User borrow requests retrieved", dto));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> completeRequest(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User not found"));
        }

        boolean cancelled = service.ReturnRequestByRequester(id, user);
        if (!cancelled) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Request cannot be cancelled (not found, not pending, or not owned by user)"));
        }
        return ResponseEntity.ok(ApiResponse.success("Complete request cancelled successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }
        String username = authentication.getName();
        Users user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User not found"));
        }

        boolean cancelled = service.cancelRequestByRequester(id, user);
        if (!cancelled) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Request cannot be cancelled (not found, not pending, or not owned by user)"));
        }
        return ResponseEntity.ok(ApiResponse.success("Borrow request cancelled successfully"));
    }

    // BorrowRequestController.java

    // Check for duplicate borrow requests
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkDuplicate(
            @RequestParam Long userId,
            @RequestParam Long assetId
    ) {
        boolean exists = service.hasExistingActiveOrPending(userId, assetId);
        return ResponseEntity.ok(ApiResponse.success("Duplicate check complete", exists));
    }


    // Create request
    @PostMapping
    public ResponseEntity<ApiResponse<BorrowRequest>> create(@RequestBody CreateRequestBody body) {
        BorrowRequest r = service.createRequest(body.getUserId(), body.getAssetId(), body.getNote());
        return ResponseEntity.ok(ApiResponse.success("Borrow request created", r));
    }

    // List: optional status query param
    @GetMapping
    public ResponseEntity<ApiResponse<List<BorrowRequest>>> list(@RequestParam(required = false) String status) {
        if (status == null || status.isBlank()) {
            List<BorrowRequest> pending = service.listPendingRequestsForAdmin();
            return ResponseEntity.ok(ApiResponse.success("Pending borrow requests", pending));
        } else {
            BorrowRequest.Status st = BorrowRequest.Status.valueOf(status.toUpperCase());
            List<BorrowRequest> list = service.listPendingRequestsForAdmin(); // minimal — could add method findByStatus
            return ResponseEntity.ok(ApiResponse.success("Requests list", list));
        }
    }



    // Approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BorrowRequest>> approve(
            @PathVariable Long id,
            @RequestParam Long adminId
    ) {
        BorrowRequest r = service.approveRequest(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Borrow request approved", r));
    }

    // Decline
    @PutMapping("/{id}/decline")
    public ResponseEntity<ApiResponse<BorrowRequest>> decline(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestParam(required = false) String reason
    ) {
        BorrowRequest r = service.declineRequest(id, adminId, reason);
        return ResponseEntity.ok(ApiResponse.success("Borrow request declined", r));
    }

    /**
     * Minimal request body object for creating borrow requests
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequestBody {
        private Long userId;
        private Long assetId;
        private String note;

    }
}
