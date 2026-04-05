package com.service.hospital_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.service.hospital_service.entity.Appointment;
import com.service.hospital_service.service.AppointmentService;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @GetMapping
    public List<Appointment> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Appointment getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/patient/{pid}")
    public List<Appointment> byPatient(@PathVariable Long pid) {
        return service.getByPatient(pid);
    }

    @GetMapping("/doctor/{did}")
    public List<Appointment> byDoctor(@PathVariable Long did) {
        return service.getByDoctor(did);
    }

    @PostMapping
    public ResponseEntity<Appointment> create(@RequestBody Appointment a) {
        return ResponseEntity.status(201).body(service.create(a));
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable Long id, @RequestBody Appointment a) {
        return service.update(id, a);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}