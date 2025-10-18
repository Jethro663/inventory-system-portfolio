// FILE: src/main/java/com/example/ecom_proj/dto/BorrowedBy.java
package com.example.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple DTO used to embed minimal borrower info inside Asset JSON.
 * Fields: id, username, fullName
 *
 * NOTE: fullName uses Users.getFullName() if you have it; otherwise null.
 * The front-end will prefer fullName then username.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BorrowedBy {
    private Long id;
    private String username;

}
