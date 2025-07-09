package com.requesttheai.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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