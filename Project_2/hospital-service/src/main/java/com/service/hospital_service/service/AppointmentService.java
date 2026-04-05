package com.service.hospital_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.service.hospital_service.entity.Appointment;
import com.service.hospital_service.repository.AppointmentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository repo;

    public List<Appointment> getAll() {
        return repo.findAll();
    }

    public List<Appointment> getByPatient(Long patientId) {
        return repo.findByPatientId(patientId);
    }

    public List<Appointment> getByDoctor(Long doctorId) {
        return repo.findByDoctorId(doctorId);
    }

    public Appointment getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public Appointment create(Appointment a) {
        return repo.save(a);
    }

    public Appointment update(Long id, Appointment a) {
        a.setId(id);
        return repo.save(a);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}