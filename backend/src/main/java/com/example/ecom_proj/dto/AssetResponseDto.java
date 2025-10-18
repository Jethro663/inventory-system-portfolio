// NOTE: New DTO for exposing asset information with current borrower info.
// NOTE: Keep it simple — fields can be extended as needed.
package com.example.ecom_proj.dto;

import com.example.ecom_proj.model.Asset;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssetResponseDto {
    // NOTE: Core asset fields (add others if your existing responses include them)
    private Long id;
    private String name;
    private String serialNumber;
    private Asset.AssetStatus status;
    private String imageUrl;
    // NOTE: New field - username or full name of current borrower if in use
    private String currentBorrower;
}
