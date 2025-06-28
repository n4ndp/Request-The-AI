package com.requesttheai.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Recharge;

@Repository
public interface RechargeRepository extends JpaRepository<Recharge, Long> {
    List<Recharge> findByUserId(Long userId);
}