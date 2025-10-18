package com.example.ecom_proj.service;

import com.example.ecom_proj.dto.UserSearchCriteria;

import com.example.ecom_proj.exceptions.AssetNotFoundException;
import com.example.ecom_proj.exceptions.UserAlreadyExistsException;
import com.example.ecom_proj.exceptions.UserNotFoundException;
import com.example.ecom_proj.model.Asset;
import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UserService {

    private final BCryptPasswordEncoder passwordEncoder;
    private final UserRepository repository;
    private final AuditService auditService;


    public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository repository, AuditService auditService) {
        this.passwordEncoder = passwordEncoder;
        this.repository = repository;
        this.auditService = auditService;
    }

    //Utility
    public boolean userExists(String username) {
        Users existingUser = repository.findByUsername(username);
        return existingUser != null;
    }

    //Main Methods

    public Users getUserByUsername(String username) {
        Users user = repository.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException(username);
        }
        // Don't expose password
        user.setPassword(null);
        return user;
    }

    public Users getUserById(long Id) {
        Users user = repository.findById(Id).orElseThrow(() -> new AssetNotFoundException(Id));
        user.setPassword(null);
        return user;
    }

    @Transactional
    public Users addUser(Users user) {
        if (userExists(user.getUsername())) {
            throw new UserAlreadyExistsException(user.getUsername());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        log.info("User {} created", user.getUsername());


        Users saved =  repository.save(user);


        auditService.log("CREATE",
                saved.getUsername(),
                saved.getId(),
                saved.toString(),
                saved.toString()
        );


        return saved;

    }

    @Transactional
    public void deleteUser(String username) {
        Users user = repository.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException(username);
        }

        auditService.log("DELETE",
                user.getUsername(),
                user.getId(),
                user.toString(),
                null
        );
        repository.delete(user);
    }

    @Transactional
    public Users updateUser(Users user) {
        // Find the existing user by username
        Users existing = repository.findByUsername(user.getUsername());
        if (existing == null) {
            throw new UserNotFoundException(user.getUsername());
        }

        // Update role
        existing.setRole(user.getRole());

        // Update password only if provided
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        Users updated = repository.save(existing);

        // Audit log
        auditService.log("UPDATE",
                updated.getUsername(),
                updated.getId(),
                "User updated - Role: " + existing.getRole(),
                "User updated - Role: " + updated.getRole()
        );

        return updated;
    }


    public List<Users> getAllUsers() {
        List<Users> users = repository.findAll();
        // Remove passwords from response
        users.forEach(user -> user.setPassword(null));
        return users;
    }

    // ... existing code ...

    /**
     * Search users with pagination
     */
    public Page<Users> searchUsers(UserSearchCriteria criteria) {
        int page = criteria.getPage() != null ? criteria.getPage() : 0;
        int size = criteria.getSize() != null ? criteria.getSize() : 10;

        Sort sort = Sort.by(Sort.Direction.ASC, "username");
        if (criteria.getSortBy() != null && !criteria.getSortBy().isBlank()) {
            Sort.Direction direction = "DESC".equalsIgnoreCase(criteria.getSortDirection())
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            sort = Sort.by(direction, criteria.getSortBy());
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // Filter by role if provided
        if (criteria.getRole() != null) {
            return repository.findByRole(criteria.getRole(), pageable);
        }

        // Search by username if provided
        if (criteria.getSearchTerm() != null && !criteria.getSearchTerm().isBlank()) {
            Page<Users> users = repository.findByUsernameContainingIgnoreCase(
                    criteria.getSearchTerm(),
                    pageable
            );
            // Remove passwords
            users.forEach(user -> user.setPassword(null));
            return users;
        }

        // Return all users paginated
        Page<Users> users = repository.findAll(pageable);
        users.forEach(user -> user.setPassword(null));
        return users;
    }

// ... existing code ...


}
