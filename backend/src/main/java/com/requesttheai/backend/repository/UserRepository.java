package com.requesttheai.backend.repository;

import com.requesttheai.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This interface extends JpaRepository to provide CRUD operations for the User entity.
    // It includes methods to find a user by username and check if a username exists.

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
}