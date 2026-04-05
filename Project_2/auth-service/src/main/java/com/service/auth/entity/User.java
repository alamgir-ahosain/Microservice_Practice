package com.service.auth.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;    // BCrypt hashed

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role { PATIENT, DOCTOR, ADMIN }
}