package com.requesttheai.backend.repository;

import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.enums.AccountStatus;
import com.requesttheai.backend.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // This interface extends JpaRepository to provide CRUD operations for the Account entity.
    // It includes methods to find accounts by email, check if an email exists, and retrieve accounts by status and role.

    Optional<Account> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Account> findByStatus(AccountStatus status);

    List<Account> findByRole(UserRole role);

    List<Account> findByStatusAndRole(AccountStatus status, UserRole role);

    List<Account> findByRegisteredAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Account a JOIN FETCH a.user")
    List<Account> findAllWithUser();
    // This method retrieves all accounts along with their associated user details using a JOIN FETCH query.
    // It is useful for optimizing performance by reducing the number of queries needed to fetch related entities.
}