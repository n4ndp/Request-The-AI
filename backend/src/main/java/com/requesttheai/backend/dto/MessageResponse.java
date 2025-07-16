package com.requesttheai.backend.dto;

import java.time.LocalDateTime;

import com.requesttheai.backend.model.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private String content;
    private MessageType messageType;
    private LocalDateTime createdAt;
    private String openAiMessageId;
    private String modelName;
} 