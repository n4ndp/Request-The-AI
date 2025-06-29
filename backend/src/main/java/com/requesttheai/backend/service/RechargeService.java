package com.requesttheai.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.requesttheai.backend.dto.RechargeHistoryResponse;
import com.requesttheai.backend.dto.RechargeRequest;
import com.requesttheai.backend.dto.RechargeResponse;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.Recharge;
import com.requesttheai.backend.model.User;
import com.requesttheai.backend.model.enums.TransactionStatus;
import com.requesttheai.backend.repository.AccountRepository;
import com.requesttheai.backend.repository.RechargeRepository;
import com.requesttheai.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RechargeService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final RechargeRepository rechargeRepository;

    @Transactional
    public RechargeResponse processRecharge(RechargeRequest rechargeRequest, String username) {
        User user = userRepository.findByUsernameWithAccount(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Account account = user.getAccount();

        if (rechargeRequest.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("The amount must be positive.");
        }

        BigDecimal newBalance = account.getBalance().add(rechargeRequest.getAmount());
        account.setBalance(newBalance);

        Recharge recharge = Recharge.builder()
                .amount(rechargeRequest.getAmount())
                .user(user)
                .status(TransactionStatus.SUCCESS)
                .build();

        rechargeRepository.save(recharge);
        accountRepository.save(account);

        return toRechargeResponse(recharge, newBalance);
    }

    @Transactional(readOnly = true)
    public List<RechargeHistoryResponse> getRechargeHistory(String username) {
        User user = userRepository.findByUsernameWithAccount(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<Recharge> recharges = rechargeRepository.findByUserId(user.getId());

        return recharges.stream()
            .map(this::toRechargeHistoryResponse)
            .collect(Collectors.toList());
    }

    private RechargeResponse toRechargeResponse(Recharge recharge, BigDecimal balance) {
        return RechargeResponse.builder()
            .transactionId(recharge.getId())
            .balance(balance)
            .timestamp(recharge.getCreatedAt())
            .status(recharge.getStatus())
            .build();
    }

    private RechargeHistoryResponse toRechargeHistoryResponse(Recharge recharge) {
        return RechargeHistoryResponse.builder()
            .transactionId(recharge.getId())
            .amount(recharge.getAmount())
            .timestamp(recharge.getCreatedAt())
            .status(recharge.getStatus())
            .build();
    }
}