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
public class SendMessageResponse {
    private Long conversationId;
    private Long userMessageId;
    private Long aiMessageId;
    private String openAiMessageId;
    private String aiResponse;
    private Integer inputTokens;
    private Integer outputTokens;
    private BigDecimal totalCost;
}