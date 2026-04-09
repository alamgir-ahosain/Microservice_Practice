package com.service.hospital_service.dto.response;

import com.service.hospital_service.enums.LOCATION_TYPE;
import lombok.Builder;

@Builder
public record LocationResponse(
        Long id,
        LOCATION_TYPE locationType,
        String address,
        String thana,
        String po,
        String city,
        Long postalCode,
        Long zoneId) {
}
