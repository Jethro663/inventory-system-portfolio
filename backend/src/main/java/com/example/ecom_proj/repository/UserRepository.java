package com.example.ecom_proj.repository;

import com.example.ecom_proj.model.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<Users, Long>, JpaSpecificationExecutor<Users> {
    Users findByUsername(String username);

    // Additional query methods for filtering
    List<Users> findByRole(Users.Role role);


    Page<Users> findByRole(Users.Role role, Pageable pageable);
    Page<Users> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
}