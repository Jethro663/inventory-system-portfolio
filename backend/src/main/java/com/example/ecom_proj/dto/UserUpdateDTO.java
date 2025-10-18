package com.example.ecom_proj.dto;


import com.example.ecom_proj.model.Users;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {

    @NotNull(message = "Username is required")
    private String username;

    @NotNull(message = "Role is required")
    private Users.Role role;

    // Password is optional for updates
    private String password;
}

