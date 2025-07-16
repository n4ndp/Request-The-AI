package com.requesttheai.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.Usage;

@Repository
public interface UsageRepository extends JpaRepository<Usage, Long> {

    @Modifying
    @Query("UPDATE Usage u SET u.message = NULL WHERE u.message.id = :messageId")
    void setNullMessageByMessageId(Long messageId);

    // Consulta optimizada para admin - con JOIN FETCH para evitar N+1
    @Query("SELECT u FROM Usage u " +
           "LEFT JOIN FETCH u.message m " +
           "LEFT JOIN FETCH m.conversation c " +
           "LEFT JOIN FETCH c.user user " +
           "LEFT JOIN FETCH m.model model " +
           "ORDER BY u.createdAt DESC")
    List<Usage> findAllWithDetailsForAdmin();

    // Consulta optimizada para usuario específico
    @Query("SELECT u FROM Usage u " +
           "LEFT JOIN FETCH u.message m " +
           "LEFT JOIN FETCH m.conversation c " +
           "LEFT JOIN FETCH m.model model " +
           "WHERE c.user.username = :username " +
           "ORDER BY u.createdAt DESC")
    List<Usage> findByUsernameWithDetails(@Param("username") String username);

    // Consulta adicional para estadísticas de admin
    @Query("SELECT COUNT(u) FROM Usage u")
    Long countTotalUsages();

    // Consulta para obtener usages paginados para admin
    @Query("SELECT u FROM Usage u " +
           "LEFT JOIN FETCH u.message m " +
           "LEFT JOIN FETCH m.conversation c " +
           "LEFT JOIN FETCH c.user user " +
           "LEFT JOIN FETCH m.model model " +
           "ORDER BY u.createdAt DESC")
    List<Usage> findAllWithDetailsPaginated();
}