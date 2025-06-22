package com.requesttheai.backend.dto;

import java.math.BigDecimal;

import com.requesttheai.backend.model.enums.TransactionType;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequest {
    @NotBlank
    private BigDecimal amount;
    
    @NotBlank
    private TransactionType transactionType;

    @NotBlank
    private String description;
}