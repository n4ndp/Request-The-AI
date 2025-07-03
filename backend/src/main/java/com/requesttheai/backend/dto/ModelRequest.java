package com.requesttheai.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
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
public class ModelRequest {
    @NotBlank
    private String name;
    
    @NotNull @DecimalMin("0.00")
    private BigDecimal priceInput;
    
    @NotNull @DecimalMin("0.00")
    private BigDecimal priceOutput;
    
    @NotBlank
    private String provider;
    
    private String description;
    
    @NotNull @DecimalMin("0.00")
    private BigDecimal profitMargin;
}