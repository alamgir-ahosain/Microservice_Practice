package com.service.hospital_service.repository;

import com.service.hospital_service.entity.hospital.HospitalLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalLocationRepository extends JpaRepository<HospitalLocation,Long> {
}
