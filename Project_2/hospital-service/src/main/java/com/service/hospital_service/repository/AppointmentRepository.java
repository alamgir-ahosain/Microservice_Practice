package com.service.hospital_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.service.hospital_service.entity.Appointment;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);
}