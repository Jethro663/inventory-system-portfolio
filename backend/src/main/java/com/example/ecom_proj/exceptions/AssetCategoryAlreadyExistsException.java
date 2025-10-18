package com.example.ecom_proj.exceptions;

public class AssetCategoryAlreadyExistsException extends RuntimeException {
    public AssetCategoryAlreadyExistsException(String name) {
        super("Asset Category already exists with name: " + name);
    }

}
