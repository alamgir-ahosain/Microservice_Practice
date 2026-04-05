package com.service.hospital_service.repository;



import com.service.hospital_service.entity.hospital.Hospital;

import org.springframework.data.jpa.repository.JpaRepository;


public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    boolean existsByName( String name);
}