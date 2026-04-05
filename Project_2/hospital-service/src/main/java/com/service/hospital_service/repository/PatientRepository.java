package com.service.hospital_service.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.service.hospital_service.entity.Patient;
public interface PatientRepository extends JpaRepository<Patient, Long> {}