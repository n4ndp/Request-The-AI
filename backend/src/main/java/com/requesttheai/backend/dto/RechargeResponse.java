package com.requesttheai.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.requesttheai.backend.model.enums.TransactionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RechargeResponse {
    private Long transactionId;
    private BigDecimal balance;
    private LocalDateTime timestamp;
    private TransactionStatus status;
}