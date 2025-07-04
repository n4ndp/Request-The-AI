package com.requesttheai.backend.dto;

import com.requesttheai.backend.model.enums.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
    
    @NotBlank
    private String fullName;
    
    @NotBlank @Email
    private String email;
    
    @NotNull
    private UserRole role;
}