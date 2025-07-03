package com.requesttheai.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.requesttheai.backend.dto.CreateUserRequest;
import com.requesttheai.backend.dto.DeleteUserResponse;
import com.requesttheai.backend.dto.UpdateProfileRequest;
import com.requesttheai.backend.dto.UserProfileResponse;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.User;
import com.requesttheai.backend.repository.AccountRepository;
import com.requesttheai.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final AccountRepository accountRepository;
    
    private final PasswordEncoder passwordEncoder;

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

    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsernameWithAccount(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        Account account = user.getAccount();

        if (!account.getEmail().equals(request.getEmail())) {
            if (accountRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, 
                    "Email already in use by another account");
            }
        }

        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        
        accountRepository.save(account);
        
        return toProfileResponse(user);
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

    @Transactional
    public UserProfileResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        Account account = Account.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(request.getRole())
                .user(user)
                .build();

        user.setAccount(account);
        User savedUser = userRepository.save(user);

        return toProfileResponse(savedUser);
    }
}