package com.service.hospital_service.dto.request;

// FIX: removed @Builder — records auto-generate a canonical constructor;
// @Builder on a record causes issues in some Lombok versions.
public record DoctorHospitalCreateRequest(
                Long hospitalId) {
}