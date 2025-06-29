package com.requesttheai.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.requesttheai.backend.dto.DeleteUserResponse;
import com.requesttheai.backend.dto.UserProfileResponse;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.User;
import com.requesttheai.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

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
            .collect(Collectors.toList());
    }

    private UserProfileResponse toProfileResponse(User user) {
        Account account = user.getAccount();
        
        return UserProfileResponse.builder()
            .username(user.getUsername())
            .fullName(account.getFullName())
            .email(account.getEmail())
            .balance(account.getBalance())
            .registeredAt(account.getCreatedAt())
            .build();
    }

    @Transactional
    public DeleteUserResponse deleteUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        userRepository.delete(user);
        
        return DeleteUserResponse.builder()
                .status("success")
                .message("User deleted successfully")
                .username(username)
                .build();
    }
}