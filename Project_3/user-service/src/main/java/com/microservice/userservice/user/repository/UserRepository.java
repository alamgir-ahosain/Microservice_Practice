package com.microservice.userservice.user.repository;


import com.microservice.userservice.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User, String> {

    User findByEmail(String email);
    boolean existsByEmail(String email);

}
