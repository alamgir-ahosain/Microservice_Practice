package com.service.hospital_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.service.hospital_service.entity.Patient;
import com.service.hospital_service.repository.PatientRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repo;

    public List<Patient> getAll() {
        return repo.findAll();
    }

    public Patient getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public Patient create(Patient p) {
        return repo.save(p);
    }

    public Patient update(Long id, Patient p) {
        p.setId(id);
        return repo.save(p);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
