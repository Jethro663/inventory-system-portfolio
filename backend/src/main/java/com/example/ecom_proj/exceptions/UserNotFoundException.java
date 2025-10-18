package com.example.ecom_proj.exceptions;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String username) {
        super("User not found with username: " + username);
    }
    public UserNotFoundException(Long username) {
        super("User not found with username: " + username);
    }
}
