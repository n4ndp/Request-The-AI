package com.requesttheai.backend.dto;

import java.math.BigDecimal;

import com.requesttheai.backend.model.enums.UserRole;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserByAdminRequest {
    @NotBlank
    private String fullName;
    
    @NotBlank @Email
    private String email;
    
    @NotNull
    private UserRole role;
    
    @NotNull
    @DecimalMin("0.00")
    private BigDecimal balance;
}