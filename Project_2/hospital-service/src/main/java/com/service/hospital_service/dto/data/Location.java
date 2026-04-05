package com.service.hospital_service.dto.data;


import com.service.hospital_service.enums.LOCATION_TYPE;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    private Long id;

    @NotNull(message = "Location type cannot be blank")
    private LOCATION_TYPE locationType;

    private String address;
    private String thana;
    private String po;

    @NotNull(message = "City cannot be blank")
    private String city;

    @NotNull(message = "Postal code cannot be blank")
    private Long postalCode;

    @NotNull(message = "Zone ID cannot be blank")
    private Long zoneId;
}
