package com.service.hospital_service.repository;


import com.service.hospital_service.entity.doctor.DoctorHospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorHospitalRepository extends JpaRepository<DoctorHospital, Long> {

    List<DoctorHospital> findByDoctorId(Long doctorId);
    List<DoctorHospital> findByHospitalId(Long hospitalId);
    Optional<DoctorHospital> findByDoctorIdAndHospitalId(Long doctorId, Long hospitalId);

}