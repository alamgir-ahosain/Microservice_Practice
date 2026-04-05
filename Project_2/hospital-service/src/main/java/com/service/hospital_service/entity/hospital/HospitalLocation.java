package com.service.hospital_service.entity.hospital;

import com.service.hospital_service.enums.LOCATION_TYPE;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "hospital_locations")
public class HospitalLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "hospital_id", unique = true)
    private Hospital hospital;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Size(max = 100)
    private String thana;

    @Size(max = 100)
    private String po;

    @Size(max = 100)
    private String city;

    private Long postalCode;

    @NotNull(message = "Zone ID cannot be null")
    private Long zoneId;

    @NotNull(message = "Must provide location type")
    @Enumerated(EnumType.STRING)
    private LOCATION_TYPE locationType;
}