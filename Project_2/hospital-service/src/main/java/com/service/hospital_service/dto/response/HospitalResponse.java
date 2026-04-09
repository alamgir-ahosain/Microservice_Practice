package com.service.hospital_service.dto.response;

import com.service.hospital_service.enums.HOSPITAL_TYPE;
import lombok.Builder;

import java.util.List;

@Builder
public record HospitalResponse(
                Long id,
                String name,
                String phoneNumber,
                String website,
                List<HOSPITAL_TYPE> types,
                Double latitude,
                Double longitude,
                LocationResponse locationResponse) {
}
