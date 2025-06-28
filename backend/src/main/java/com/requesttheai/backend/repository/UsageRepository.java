package com.requesttheai.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Usage;

@Repository
public interface UsageRepository extends JpaRepository<Usage, Long> {

}