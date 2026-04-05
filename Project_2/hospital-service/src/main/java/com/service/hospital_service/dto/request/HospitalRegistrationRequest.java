package com.service.hospital_service.dto.request;



import com.service.hospital_service.entity.hospital.HospitalLocation;
import com.service.hospital_service.enums.HOSPITAL_TYPE;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRegistrationRequest {

        Long id;

        @NotBlank(message = "Hospital name cannot be blank")
        @Size(max = 150)
        String name;

        @Size(max = 20)
        String phoneNumber;

        @Size(max = 255)
        String website;


        Double latitude;
        Double longitude;


        @NotEmpty(message = "At least one hospital type must be specified")
        List<HOSPITAL_TYPE> types;

        @Valid
        HospitalLocation location;



}