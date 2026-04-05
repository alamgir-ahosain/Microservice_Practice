package com.service.hospital_service.service.abstraction;

import com.service.hospital_service.dto.request.DoctorRegistrationRequest;
import com.service.hospital_service.dto.response.DoctorResponse;

import java.util.List;

public interface DoctorService {
    DoctorResponse createDoctor(DoctorRegistrationRequest request);
    List<DoctorResponse> getAllDoctors();
    DoctorResponse getDoctorById(Long id);
    DoctorResponse updateDoctor(Long id, DoctorRegistrationRequest request);
    void deleteDoctor(Long id);
}