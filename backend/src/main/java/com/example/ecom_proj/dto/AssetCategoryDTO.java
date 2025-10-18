package com.example.ecom_proj.dto;

import com.example.ecom_proj.model.AssetCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetCategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private int assetCount;

    public AssetCategoryDTO(AssetCategory category, int assetCount) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        this.iconUrl = category.getIconUrl();
        this.assetCount = assetCount; // use count directly
    }
}
