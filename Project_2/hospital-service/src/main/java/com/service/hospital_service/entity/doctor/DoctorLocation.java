package com.service.hospital_service.entity.doctor;

import com.service.hospital_service.enums.LOCATION_TYPE;
import jakarta.persistence.*;
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
@Table(name = "doctor_locations")
public class DoctorLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "doctor_id", unique = true)
    private Doctor doctor;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Size(max = 100)
    private String thana;

    @Size(max = 100)
    private String po;

    @Size(max = 100)
    private String city;

    private Long postalCode;

    private Long zoneId;

    @Enumerated(EnumType.STRING)
    private LOCATION_TYPE locationType;
}