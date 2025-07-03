package com.requesttheai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long conversationId;
    private String aiResponse;
    private BigDecimal inputCost;
    private BigDecimal outputCost;
    private BigDecimal remainingBalance;
}