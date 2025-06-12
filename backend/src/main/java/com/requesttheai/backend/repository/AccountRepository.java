package com.requesttheai.backend.repository;

import com.requesttheai.backend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
}