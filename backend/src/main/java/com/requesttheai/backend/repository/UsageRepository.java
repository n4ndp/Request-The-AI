package com.requesttheai.backend.repository;

import com.requesttheai.backend.model.Usage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UsageRepository extends JpaRepository<Usage, Long> {

    @Modifying
    @Query("UPDATE Usage u SET u.message = NULL WHERE u.message.id = :messageId")
    void setNullMessageByMessageId(Long messageId);
}