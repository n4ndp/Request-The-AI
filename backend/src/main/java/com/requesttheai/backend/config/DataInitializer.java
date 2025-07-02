package com.requesttheai.backend.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.requesttheai.backend.model.Model;
import com.requesttheai.backend.repository.ModelRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final ModelRepository modelRepository;

    @Bean
    public ApplicationRunner initializeData() {
        return args -> {
            // Solo insertar si no hay modelos en la base de datos
            if (modelRepository.count() == 0) {
                log.info("Inicializando modelos en la base de datos...");
                insertInitialModels();
                log.info("Modelos inicializados correctamente.");
            } else {
                log.info("Los modelos ya están inicializados en la base de datos.");
            }
        };
    }

    private void insertInitialModels() {
        List<Model> models = List.of(
            // Modelos de OpenAI
            Model.builder()
                .name("GPT-4")
                .provider("openai")
                .description("Más potente")
                .priceInput(new BigDecimal("0.03"))
                .priceOutput(new BigDecimal("0.06"))
                .profitMargin(new BigDecimal("0.10"))
                .build(),
            
            Model.builder()
                .name("GPT-4 Turbo")
                .provider("openai")
                .description("Más rápido")
                .priceInput(new BigDecimal("0.01"))
                .priceOutput(new BigDecimal("0.03"))
                .profitMargin(new BigDecimal("0.10"))
                .build(),
            
            Model.builder()
                .name("GPT-3.5 Turbo")
                .provider("openai")
                .description("Eficiente")
                .priceInput(new BigDecimal("0.0015"))
                .priceOutput(new BigDecimal("0.002"))
                .profitMargin(new BigDecimal("0.10"))
                .build(),

            // Modelos de Anthropic
            Model.builder()
                .name("Claude 3.5 Sonnet")
                .provider("anthropic")
                .description("Más inteligente")
                .priceInput(new BigDecimal("0.003"))
                .priceOutput(new BigDecimal("0.015"))
                .profitMargin(new BigDecimal("0.10"))
                .build(),
            
            Model.builder()
                .name("Claude 3 Opus")
                .provider("anthropic")
                .description("Más creativo")
                .priceInput(new BigDecimal("0.015"))
                .priceOutput(new BigDecimal("0.075"))
                .profitMargin(new BigDecimal("0.10"))
                .build(),
            
            Model.builder()
                .name("Claude 3 Haiku")
                .provider("anthropic")
                .description("Más rápido")
                .priceInput(new BigDecimal("0.00025"))
                .priceOutput(new BigDecimal("0.00125"))
                .profitMargin(new BigDecimal("0.10"))
                .build()
        );

        modelRepository.saveAll(models);
    }
} 