package com.requesttheai.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.requesttheai.backend.model.enums.AccountStatus;

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

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Account account;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Conversation> conversations;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Recharge> recharges;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(account.getRole().name()));
    }

    @Override
    public boolean isAccountNonExpired() {
     return true;
    }

    @Override
    public boolean isAccountNonLocked() {
     return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
     return true;
    }

    @Override
    public boolean isEnabled() {
        return account != null && account.getStatus() == AccountStatus.ACTIVE;
    }
}