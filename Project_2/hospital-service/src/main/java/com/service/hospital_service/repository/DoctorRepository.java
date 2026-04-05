package com.service.hospital_service.repository;


import com.service.hospital_service.entity.doctor.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {}