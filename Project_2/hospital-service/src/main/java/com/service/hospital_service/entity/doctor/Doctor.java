package com.service.hospital_service.entity.doctor;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @ElementCollection
    @CollectionTable(name = "doctor_specialties", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "specialty")
    @Builder.Default
    private List<String> specialties = new ArrayList<>();

    private String phoneNumber;
    private String email;

    private Long locationId;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DoctorHospital> doctorHospitals = new ArrayList<>();
}