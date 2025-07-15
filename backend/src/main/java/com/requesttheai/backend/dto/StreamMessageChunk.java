package com.requesttheai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreamMessageChunk {
    private String type; // "start", "content", "end", "error"
    private String content;
    private Long conversationId;
    private Long userMessageId;
    private Long aiMessageId;
    private String openAiMessageId;
    private Integer inputTokens;
    private Integer outputTokens;
    private java.math.BigDecimal totalCost;
    private String error;
} 