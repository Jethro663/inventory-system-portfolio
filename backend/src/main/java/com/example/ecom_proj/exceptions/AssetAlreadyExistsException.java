package com.example.ecom_proj.exceptions;

public class AssetAlreadyExistsException extends RuntimeException {
    public AssetAlreadyExistsException(String name) {
        super("Asset already exists with name: " + name);
    }
    public AssetAlreadyExistsException(String serialNumber, Long id) {
        super("Asset already exists with Serial Number: " + serialNumber + ", Conflict ID: " + id);
    }
}
