package com.example.ecom_proj.exceptions;

public class AssetNotFoundException extends RuntimeException {
    public AssetNotFoundException(Long id) {
        super("Asset not found with id: " + id);
    }
}

