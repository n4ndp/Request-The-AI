package com.requesttheai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.requesttheai.backend.dto.DeleteUserResponse;
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

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserProfileResponse>> getAllUserProfiles() {
        return ResponseEntity.ok(userService.getAllUserProfiles());
    }

    @DeleteMapping("/delete/{username}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DeleteUserResponse> deleteUser(@PathVariable String username) {
        return ResponseEntity.ok(
            userService.deleteUserByUsername(username)
        );
    }
}