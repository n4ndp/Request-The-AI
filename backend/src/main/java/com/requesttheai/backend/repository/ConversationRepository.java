package com.requesttheai.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

}