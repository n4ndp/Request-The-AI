package com.requesttheai.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsageUserResponse {
    private Long id;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private Integer tokens;
    private String modelName;
} 