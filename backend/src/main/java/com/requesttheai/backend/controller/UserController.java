package com.requesttheai.backend.controller;

import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public String getAuthenticatedUser() {
        return "Authenticated user details";
    }

    @GetMapping
    public String getAllUsers() {
        return "List of all users";
    }
}