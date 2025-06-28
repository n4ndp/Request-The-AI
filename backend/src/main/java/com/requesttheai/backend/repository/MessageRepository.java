package com.requesttheai.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

}