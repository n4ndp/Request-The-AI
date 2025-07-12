package com.requesttheai.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    @NotBlank
    private String content;
    
    private Long conversationId;

    private String previousMessageOpenAiId;
    
    @NotBlank
    private String modelName;
}