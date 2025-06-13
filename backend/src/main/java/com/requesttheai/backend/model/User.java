package com.requesttheai.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.requesttheai.backend.model.enums.AccountStatus;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users", 
       uniqueConstraints = @UniqueConstraint(name = "uk_users_username", columnNames = "username"))
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    // This class represents a user in the system, implementing UserDetails for Spring Security.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(nullable = false, length = 50)
    private String username;

    @NotBlank
    @Size(min = 8)
    @Column(nullable = false)
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Account account;
    // The account field is a one-to-one relationship with the Account entity.
    // It represents the user's account details, such as role, status, and balance.
    // The cascade attribute specifies that operations like persist, merge, and remove should be cascaded to the Account entity.

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // When implementing UserDetails, we need to provide the following methods:

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(account.getRole().name()));
    }
    // The authorities are derived from the user's account role.
    // Here, we assume that the account has a role field of type UserRole.

    @Override
    public boolean isAccountNonExpired() {
     return true;
    }
    // This method indicates whether the user's account has expired.
    // In this case, we assume that accounts do not expire, so we return true.

    @Override
    public boolean isAccountNonLocked() {
     return true;
    }
    // This method indicates whether the user's account is locked.
    // In this case, we assume that accounts are not locked, so we return true.

    @Override
    public boolean isCredentialsNonExpired() {
     return true;
    }
    // This method indicates whether the user's credentials (password) have expired.
    // In this case, we assume that credentials do not expire, so we return true.

    @Override
    public boolean isEnabled() {
        return account != null && account.getStatus() == AccountStatus.ACTIVE;
    }
    // This method indicates whether the user's account is enabled.
    // We check if the account is not null and its status is ACTIVE.
}