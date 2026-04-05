package com.service.hospital_service.repository;


import com.service.hospital_service.entity.doctor.DoctorLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorLocationRepository extends JpaRepository<DoctorLocation, Long> {
}