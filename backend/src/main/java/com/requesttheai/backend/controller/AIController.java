package com.requesttheai.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import com.requesttheai.backend.dto.AIRequest;
import com.requesttheai.backend.dto.AIResponse;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Value("${openai.api.key}")
    private String apiKey;

    private com.openai.client.OpenAIClient buildClient() {
        return OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .build();
    }

    @PostMapping("/chat")
    public AIResponse chat(@RequestBody AIRequest request) {
        OpenAIClient client = buildClient();

        ResponseCreateParams.Builder paramsBuilder = ResponseCreateParams.builder()
                .input(request.getMessage())
                .model(ChatModel.of(request.getModel()))
                .store(true);

        if (request.getPreviousResponseId() != null) {
            paramsBuilder.previousResponseId(request.getPreviousResponseId());
        }

        var response = client.responses().create(paramsBuilder.build());

        List<String> outputs = response.output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .map(text -> text.text())
                .collect(Collectors.toList());
        
        String finalMessage = outputs.isEmpty() ? "(Sin respuesta)" : outputs.get(0);
        String responseId = response.id();

        return AIResponse.builder()
                .message(finalMessage)
                .modelUsed(request.getModel())
                .responseId(responseId)
                .build();
    }
}
