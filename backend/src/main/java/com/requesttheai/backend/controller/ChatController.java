package com.requesttheai.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.requesttheai.backend.dto.ConversationDetailResponse;
import com.requesttheai.backend.dto.ConversationSummaryResponse;
import com.requesttheai.backend.dto.CreateConversationRequest;
import com.requesttheai.backend.dto.SendMessageRequest;
import com.requesttheai.backend.dto.SendMessageResponse;
import com.requesttheai.backend.service.ChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/conversations")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<List<ConversationSummaryResponse>> getUserConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(chatService.getUserConversations(userDetails.getUsername()));
    }

    @GetMapping("/conversations/{conversationId}")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<ConversationDetailResponse> getConversationDetail(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(chatService.getConversationDetail(conversationId, userDetails.getUsername()));
    }

    @PostMapping("/conversation")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<ConversationSummaryResponse> createConversation(
            @Valid @RequestBody CreateConversationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(chatService.createConversation(request, userDetails.getUsername()));
    }

    @PostMapping("/message")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<SendMessageResponse> sendMessage(@RequestBody SendMessageRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(chatService.sendMessage(request, userDetails.getUsername()));
    }

    @PostMapping(value = "/message/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAuthority('USER')")
    public SseEmitter sendMessageStream(@RequestBody SendMessageRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        return chatService.sendMessageStream(request, userDetails.getUsername());
    }
}