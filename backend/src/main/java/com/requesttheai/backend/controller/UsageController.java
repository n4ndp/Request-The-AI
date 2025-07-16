package com.requesttheai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.requesttheai.backend.dto.UsageAdminResponse;
import com.requesttheai.backend.dto.UsageUserResponse;
import com.requesttheai.backend.service.UsageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usages")
@RequiredArgsConstructor
public class UsageController {

    private final UsageService usageService;

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UsageAdminResponse>> getAllUsagesForAdmin() {
        return ResponseEntity.ok(usageService.getAllUsagesForAdmin());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<List<UsageUserResponse>> getUsageForCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(usageService.getUsagesForUser(userDetails.getUsername()));
    }

    @GetMapping("/admin/count")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Long> getTotalUsagesCount() {
        return ResponseEntity.ok(usageService.getTotalUsagesCount());
    }
} 