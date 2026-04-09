package com.service.hospital_service.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record DoctorResponse(
                Long id,
                String name,
                List<String> specialties,
                String phoneNumber,
                String email,
                LocationResponse locationResponse,
                List<DoctorHospitalResponse> doctorHospitals) {
}