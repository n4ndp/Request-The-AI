package com.requesttheai.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.requesttheai.backend.model.enums.TransactionStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsageAdminResponse {
    private Long id;
    private String username;
    private BigDecimal realAmount;
    private BigDecimal platformRevenue;
    private BigDecimal totalAmount;
    private TransactionStatus status;
    private LocalDateTime createdAt;
    private Integer tokens;
    private String modelName;
} 