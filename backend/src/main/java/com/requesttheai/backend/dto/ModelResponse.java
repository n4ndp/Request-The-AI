package com.requesttheai.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelResponse {
    private Long id;
    private String name;
    private BigDecimal priceInput;
    private BigDecimal priceOutput;
    private String provider;
    private String description;
    private BigDecimal profitMargin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}