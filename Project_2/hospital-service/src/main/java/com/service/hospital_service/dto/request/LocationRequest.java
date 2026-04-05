package com.service.hospital_service.dto.request;


import com.service.hospital_service.enums.LOCATION_TYPE;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record LocationRequest(
        Long id,
        @NotNull(message = "Location type must be provided")
        LOCATION_TYPE locationType,
        String address,
        String thana,
        String po,
        @NotNull(message = "City must be provided")
        String city,
        @NotNull(message = "Postal code must be provided")
        Long postalCode,
        @NotNull(message = "Zone ID must be provided")
        Long zoneId
) {}