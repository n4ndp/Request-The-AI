package com.requesttheai.backend.service;

import com.requesttheai.backend.dto.UserProfileResponse;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.User;
import com.requesttheai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsernameWithAccount(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        return toProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUserProfiles() {
        return userRepository.findAllWithAccount().stream()
            .map(this::toProfileResponse)
            .toList();
    }

    private UserProfileResponse toProfileResponse(User user) {
        Account account = user.getAccount();
        
        return UserProfileResponse.builder()
            .username(user.getUsername())
            .fullName(account.getFullName())
            .email(account.getEmail())
            .balance(account.getBalance())
            .registeredAt(account.getRegisteredAt())
            .build();
    }
}