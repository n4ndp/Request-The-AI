package com.requesttheai.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.requesttheai.backend.dto.AuthResponse;
import com.requesttheai.backend.dto.LoginRequest;
import com.requesttheai.backend.dto.RegisterRequest;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.User;
import com.requesttheai.backend.model.enums.UserRole;
import com.requesttheai.backend.repository.AccountRepository;
import com.requesttheai.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    private final AccountRepository accountRepository;

    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsernameWithAccount(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getUsername()));

        String token = jwtService.getToken(user);
        return AuthResponse.builder()
                .token(token)
                .role(user.getAccount().getRole())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
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
                .role(UserRole.USER)
                .user(user)
                .build();

        user.setAccount(account);
        userRepository.save(user);

        return AuthResponse.builder()
                .token(jwtService.getToken(user))
                .role(account.getRole())
                .build();
    }
}