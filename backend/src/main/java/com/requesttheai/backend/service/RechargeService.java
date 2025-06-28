package com.requesttheai.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.requesttheai.backend.dto.RechargeRequest;
import com.requesttheai.backend.dto.RechargeResponse;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.Recharge;
import com.requesttheai.backend.model.User;
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
                .build();

        rechargeRepository.save(recharge);
        accountRepository.save(account);

        return toRechargeResponse(recharge);
    }

    @Transactional(readOnly = true)
    public List<RechargeResponse> getRechargeHistory(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<Recharge> recharges = rechargeRepository.findByUserId(user.getId());

        return recharges.stream()
            .map(this::toRechargeResponse)
            .collect(Collectors.toList());
    }

    private RechargeResponse toRechargeResponse(Recharge recharge) {
        return RechargeResponse.builder()
            .transactionId(recharge.getId())
            .amount(recharge.getAmount())
            .timestamp(recharge.getTimestamp())
            .build();
    }
}