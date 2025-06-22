package com.requesttheai.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.requesttheai.backend.model.enums.TransactionStatus;
import com.requesttheai.backend.model.enums.TransactionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {
    private BigDecimal amount;
    private TransactionType transactionType;
    private String description;
    private TransactionStatus status;
    private LocalDateTime transactionDate;
}