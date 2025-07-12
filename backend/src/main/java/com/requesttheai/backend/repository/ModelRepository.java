package com.requesttheai.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Model;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    Optional<Model> findByName(String name);
}