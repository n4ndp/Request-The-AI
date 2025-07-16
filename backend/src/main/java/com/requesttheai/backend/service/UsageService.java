package com.requesttheai.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.requesttheai.backend.dto.UsageAdminResponse;
import com.requesttheai.backend.dto.UsageUserResponse;
import com.requesttheai.backend.model.Usage;
import com.requesttheai.backend.repository.UsageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsageService {

    private final UsageRepository usageRepository;

    @Transactional(readOnly = true)
    public List<UsageAdminResponse> getAllUsagesForAdmin() {
        return usageRepository.findAllWithDetailsForAdmin().stream()
            .map(this::toUsageAdminResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UsageUserResponse> getUsagesForUser(String username) {
        return usageRepository.findByUsernameWithDetails(username).stream()
            .map(this::toUsageUserResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getTotalUsagesCount() {
        return usageRepository.countTotalUsages();
    }

    private UsageAdminResponse toUsageAdminResponse(Usage usage) {
        return UsageAdminResponse.builder()
            .id(usage.getId())
            .username(usage.getUser() != null ? usage.getUser().getUsername() : "Unknown")
            .realAmount(usage.getRealAmount())
            .platformRevenue(usage.getPlatformRevenue())
            .totalAmount(usage.getTotalAmount())
            .status(usage.getStatus())
            .createdAt(usage.getCreatedAt())
            .tokens(usage.getTokens())
            .modelName(usage.getModelName() != null ? usage.getModelName() : "Unknown")
            .build();
    }

    private UsageUserResponse toUsageUserResponse(Usage usage) {
        return UsageUserResponse.builder()
            .id(usage.getId())
            .totalAmount(usage.getTotalAmount())
            .createdAt(usage.getCreatedAt())
            .tokens(usage.getTokens())
            .modelName(usage.getModelName() != null ? usage.getModelName() : "Unknown")
            .build();
    }
} 