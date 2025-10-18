package com.example.ecom_proj.service;

import com.example.ecom_proj.model.Users;
import com.example.ecom_proj.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * This method is called by Spring Security when someone tries to login.
     * 
     * @param username - The username entered during login
     * @return UserDetails - Spring Security's representation of a user
     * @throws UsernameNotFoundException - If user doesn't exist
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Find the user in OUR database
        Users user = userRepository.findByUsername(username);
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        
        // 2. Convert OUR Users model to Spring Security's UserDetails
        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())  // Already encrypted with BCrypt
                .authorities(getAuthorities(user))  // Convert role to authorities
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
    
    /**
     * Convert our User Role to Spring Security Authorities
     * 
     * Spring Security uses "authorities" (permissions)
     * We're converting ADMIN → ROLE_ADMIN, STAFF → ROLE_STAFF, etc.
     */
    private Collection<? extends GrantedAuthority> getAuthorities(Users user) {
        // The "ROLE_" prefix is important! Spring Security requires it
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }
}
