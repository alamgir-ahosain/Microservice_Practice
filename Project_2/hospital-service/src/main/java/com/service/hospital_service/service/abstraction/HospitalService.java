package com.service.hospital_service.service.abstraction;

import com.service.hospital_service.dto.request.HospitalRegistrationRequest;
import com.service.hospital_service.dto.response.HospitalResponse;

import java.util.List;

public interface HospitalService {
    HospitalResponse registerHospital(HospitalRegistrationRequest request);

    List<HospitalResponse> getAllHospitals();

    HospitalResponse getHospitalById(Long id);

    HospitalResponse updateHospital(Long id, HospitalRegistrationRequest request);

    void deleteHospital(Long id);
}