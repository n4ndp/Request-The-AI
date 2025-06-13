package com.requesttheai.backend.service;

import com.requesttheai.backend.dto.AuthResponse;
import com.requesttheai.backend.dto.LoginRequest;
import com.requesttheai.backend.dto.RegisterRequest;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.User;
import com.requesttheai.backend.repository.AccountRepository;
import com.requesttheai.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    // This service handles user authentication and registration.
    // It uses UserRepository to manage user data, AccountRepository for account details,
    // JwtService for generating JWT tokens, and PasswordEncoder for encoding passwords.

    private final UserRepository userRepository;

    private final AccountRepository accountRepository;

    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;
    // The AuthenticationManager is used to authenticate users based on their credentials.

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetails userDetails = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtService.getToken(userDetails);
        return AuthResponse.builder()
                .token(token)
                .role(((User) userDetails).getAccount().getRole())
                .build();
    }
    // The login method authenticates the user using the provided username and password.
    // If authentication is successful, it retrieves the user details and generates a JWT token.

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
                .user(user)
                .build();

        user.setAccount(account);
        userRepository.save(user);

        return AuthResponse.builder()
                .token(jwtService.getToken(user))
                .role(account.getRole())
                .build();
    }
    // The register method creates a new user and account based on the provided registration request.
    // If the registration is successful, it generates a JWT token for the new user.
    // The @Transactional annotation ensures that the entire registration process is atomic,
    // meaning that if any part of the process fails, all changes are rolled back to maintain data integrity.
}