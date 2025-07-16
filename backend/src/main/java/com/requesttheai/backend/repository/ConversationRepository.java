package com.requesttheai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Conversation> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c LEFT JOIN FETCH c.messages WHERE c.id = :conversationId AND c.user.id = :userId")
    Optional<Conversation> findByIdAndUserIdWithMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

}