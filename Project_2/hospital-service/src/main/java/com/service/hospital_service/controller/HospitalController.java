package com.service.hospital_service.controller;

import com.service.hospital_service.dto.request.HospitalRegistrationRequest;
import com.service.hospital_service.dto.response.HospitalResponse;
import com.service.hospital_service.service.abstraction.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hospital/v1")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    // POST /hospital/v1/register → 201
    @PostMapping("/register")
    public ResponseEntity<HospitalResponse> register(
            @Valid @RequestBody HospitalRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hospitalService.registerHospital(request));
    }

    // GET /hospital/v1 → 200 list
    @GetMapping
    public ResponseEntity<List<HospitalResponse>> getAll() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    // GET /hospital/v1/{id} → 200
    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.getHospitalById(id));
    }

    // PUT /hospital/v1/{id} → 200
    @PutMapping("/{id}")
    public ResponseEntity<HospitalResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody HospitalRegistrationRequest request) {
        return ResponseEntity.ok(hospitalService.updateHospital(id, request));
    }

    // DELETE /hospital/v1/{id} → 204
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.noContent().build();
    }
}