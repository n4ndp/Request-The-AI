package com.requesttheai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.requesttheai.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u JOIN FETCH u.account WHERE u.username = :username")
    Optional<User> findByUsernameWithAccount(String username);
    
    @Query("SELECT u FROM User u JOIN FETCH u.account")
    List<User> findAllWithAccount();
}