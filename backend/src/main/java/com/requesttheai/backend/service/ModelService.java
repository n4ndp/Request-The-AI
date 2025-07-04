package com.requesttheai.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.requesttheai.backend.dto.ModelRequest;
import com.requesttheai.backend.dto.ModelResponse;
import com.requesttheai.backend.model.Model;
import com.requesttheai.backend.repository.ModelRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ModelService {

    private final ModelRepository modelRepository;

    @Transactional(readOnly = true)
    public List<ModelResponse> getAllModels() {
        return modelRepository.findAll().stream()
                .map(this::toModelResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ModelResponse> getAllModelsTotalInfo() {
        return modelRepository.findAll().stream()
                .map(this::toModelTotalInfoResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ModelResponse getModelById(Long id) {
        Model model = modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model not found"));
        return toModelTotalInfoResponse(model);
    }

    @Transactional
    public ModelResponse createModel(ModelRequest request) {
        Model model = Model.builder()
                .name(request.getName())
                .priceInput(request.getPriceInput())
                .priceOutput(request.getPriceOutput())
                .provider(request.getProvider())
                .description(request.getDescription())
                .profitMargin(request.getProfitMargin())
                .build();

        Model savedModel = modelRepository.save(model);
        return toModelTotalInfoResponse(savedModel);
    }

    @Transactional
    public ModelResponse updateModel(Long id, ModelRequest request) {
        Model model = modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model not found"));

        model.setName(request.getName());
        model.setPriceInput(request.getPriceInput());
        model.setPriceOutput(request.getPriceOutput());
        model.setProvider(request.getProvider());
        model.setDescription(request.getDescription());
        model.setProfitMargin(request.getProfitMargin());

        Model updatedModel = modelRepository.save(model);
        return toModelTotalInfoResponse(updatedModel);
    }

    @Transactional
    public void deleteModel(Long id) {
        if (!modelRepository.existsById(id)) {
            throw new RuntimeException("Model not found");
        }
        modelRepository.deleteById(id);
    }

    private ModelResponse toModelResponse(Model model) {
        return ModelResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .priceInput(model.getPriceInput())
                .priceOutput(model.getPriceOutput())
                .provider(model.getProvider())
                .description(model.getDescription())
                .build();
    }

    private ModelResponse toModelTotalInfoResponse(Model model) {
        return ModelResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .priceInput(model.getPriceInput())
                .priceOutput(model.getPriceOutput())
                .provider(model.getProvider())
                .description(model.getDescription())
                .profitMargin(model.getProfitMargin())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .build();
    }
}