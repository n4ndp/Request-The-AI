package com.requesttheai.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDetailResponse {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime endedAt;
    private List<MessageResponse> messages;
} 