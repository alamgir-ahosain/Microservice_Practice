package com.service.hospital_service.dto.request;

import com.service.hospital_service.dto.data.Location;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRegistrationRequest {

        String userId;

        @NotBlank(message = "Doctor name cannot be blank")
        String name;

        List<String> specialties;

        String phoneNumber;

        String email;

        @Valid
        Location location;

        List<DoctorHospitalCreateRequest> doctorHospitals;
}