package com.requesttheai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.requesttheai.backend.dto.RechargeHistoryResponse;
import com.requesttheai.backend.dto.RechargeRequest;
import com.requesttheai.backend.dto.RechargeResponse;
import com.requesttheai.backend.service.RechargeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recharge")
@RequiredArgsConstructor
public class RechargeController {

    private final RechargeService rechargeService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER')")
    public ResponseEntity<RechargeResponse> rechargeBalance(@RequestBody RechargeRequest rechargeRequest, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            rechargeService.processRecharge(rechargeRequest, userDetails.getUsername())
        );
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<List<RechargeHistoryResponse>> getRechargeHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            rechargeService.getRechargeHistory(userDetails.getUsername())
        );
    }
}