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

    // FIX: was @JoinColumn(name = "hospital_id") — wrong name, wrong unique
    // constraint
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

    // FIX: removed @NotNull — zoneId is optional from the frontend
    private Long zoneId;

    // FIX: removed @NotNull — locationType is optional (dropdown may be left blank)
    @Enumerated(EnumType.STRING)
    private LOCATION_TYPE locationType;
}