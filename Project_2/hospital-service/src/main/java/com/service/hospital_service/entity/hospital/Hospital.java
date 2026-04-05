package com.service.hospital_service.entity.hospital;



import com.service.hospital_service.enums.HOSPITAL_TYPE;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Hospital name cannot be blank")
    @Size(max = 150)
    private String name;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 255)
    private String website;


    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
    private Double longitude;








    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "hospital_types", joinColumns = @JoinColumn(name = "hospital_id"))
    @Column(name = "type")
    @NotEmpty(message = "At least one hospital type must be specified")
    private List<HOSPITAL_TYPE> types;



    @OneToOne(mappedBy = "hospital", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private HospitalLocation location;


}