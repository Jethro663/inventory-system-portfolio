package com.example.ecom_proj.exceptions;

public class AssetCategoryNotFoundException extends RuntimeException {
    public AssetCategoryNotFoundException(String name) {
        super("Asset Category does not exist with name: " + name);
    }
    public AssetCategoryNotFoundException(Long id) {
        super("Asset Category does not exist with id: " + id);
    }

}
