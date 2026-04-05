package com.service.hospital_service.controller;

import com.service.hospital_service.dto.request.DoctorRegistrationRequest;
import com.service.hospital_service.dto.response.DoctorResponse;
import com.service.hospital_service.service.abstraction.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // POST /api/doctors → 201
    @PostMapping
    public ResponseEntity<DoctorResponse> create(
            @Valid @RequestBody DoctorRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorService.createDoctor(request));
    }

    // GET /api/doctors → 200 list
    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAll() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // GET /api/doctors/{id} → 200
    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    // PUT /api/doctors/{id} → 200
    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRegistrationRequest request) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    // DELETE /api/doctors/{id} → 204
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}