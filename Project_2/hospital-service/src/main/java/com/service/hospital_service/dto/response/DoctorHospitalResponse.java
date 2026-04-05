package com.service.hospital_service.dto.response;

import lombok.Builder;

@Builder
public record DoctorHospitalResponse(
                Long id,
                Long hospitalId,
                String hospitalName) {
}