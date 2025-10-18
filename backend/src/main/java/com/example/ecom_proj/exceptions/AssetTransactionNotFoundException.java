package com.example.ecom_proj.exceptions;

public class AssetTransactionNotFoundException extends RuntimeException {
    public AssetTransactionNotFoundException(Long id) {
        super("Asset Transaction does not exist with id: " + id);
    }
    public AssetTransactionNotFoundException(String id) {
        super("Asset Transaction does not exist with id: " + id);
    }

}
