package com.requesttheai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.requesttheai.backend.dto.CreateUserRequest;
import com.requesttheai.backend.dto.DeleteUserResponse;
import com.requesttheai.backend.dto.UpdateProfileRequest;
import com.requesttheai.backend.dto.UpdateUserByAdminRequest;
import com.requesttheai.backend.dto.UserProfileResponse;
import com.requesttheai.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            userService.getUserProfile(userDetails.getUsername())
        );
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            userService.updateProfile(userDetails.getUsername(), request)
        );
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserProfileResponse>> getAllUserProfiles() {
        return ResponseEntity.ok(userService.getAllUserProfiles());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserProfileResponse> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{username}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserByAdmin(@PathVariable String username, @RequestBody UpdateUserByAdminRequest request) {
        return ResponseEntity.ok(userService.updateUserByAdmin(username, request));
    }

    @DeleteMapping("/delete/{username}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DeleteUserResponse> deleteUser(@PathVariable String username) {
        return ResponseEntity.ok(
            userService.deleteUserByUsername(username)
        );
    }
}