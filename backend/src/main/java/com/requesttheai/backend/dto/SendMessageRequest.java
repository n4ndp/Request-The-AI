package com.requesttheai.backend.dto;

import java.util.List;

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
    // Para compatibilidad hacia atrás con mensajes de solo texto
    private String content;
    
    // Para mensajes multimodales (texto + imágenes)
    private List<MessageContent> multimodalContent;
    
    private Long conversationId;

    private String previousMessageOpenAiId;
    
    @NotBlank
    private String modelName;
    
    // Método de conveniencia para verificar si es contenido multimodal
    public boolean isMultimodal() {
        return multimodalContent != null && !multimodalContent.isEmpty();
    }
    
    // Método de conveniencia para obtener el contenido como texto (para logging y tokens)
    public String getTextContent() {
        if (content != null) {
            return content;
        }
        
        if (multimodalContent != null) {
            return multimodalContent.stream()
                .filter(c -> "text".equals(c.getType()))
                .map(MessageContent::getText)
                .reduce("", (a, b) -> a + " " + b)
                .trim();
        }
        
        return "";
    }
}