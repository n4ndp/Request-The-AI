package com.requesttheai.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.enums.AccountStatus;
import com.requesttheai.backend.model.enums.UserRole;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Account> findByStatus(AccountStatus status);

    List<Account> findByRole(UserRole role);

    List<Account> findByStatusAndRole(AccountStatus status, UserRole role);

    List<Account> findByRegisteredAtBetween(LocalDateTime start, LocalDateTime end);
}