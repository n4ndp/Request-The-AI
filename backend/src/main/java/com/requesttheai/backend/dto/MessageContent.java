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
public class MessageContent {
    @NotBlank
    private String type; // "text" or "image_url"
    
    private String text; // Para contenido de texto
    
    private ImageUrl imageUrl; // Para contenido de imagen
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageUrl {
        @NotBlank
        private String url; // URL base64 o HTTP de la imagen
        private String detail; // "low", "high", o "auto" - opcional para optimización
    }
} 