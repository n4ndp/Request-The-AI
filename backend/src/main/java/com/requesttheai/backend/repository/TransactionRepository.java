package com.requesttheai.backend.repository;

import com.requesttheai.backend.model.Transaction;
import com.requesttheai.backend.model.enums.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByAccountIdOrderByTransactionDateDesc(Long accountId);

    List<Transaction> findByAccountIdAndTransactionTypeOrderByTransactionDateDesc(Long accountId, TransactionType transactionType);
}