package com.service.hospital_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.service.hospital_service.entity.Patient;
import com.service.hospital_service.service.PatientService;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService service;

    @GetMapping
    public List<Patient> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<Patient> create(@RequestBody Patient p) {
        return ResponseEntity.status(201).body(service.create(p));
    }

    @PutMapping("/{id}")
    public Patient update(@PathVariable Long id, @RequestBody Patient p) {
        return service.update(id, p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}