package com.service.hospital_service.service.implementations;

import com.service.hospital_service.dto.request.HospitalRegistrationRequest;
import com.service.hospital_service.dto.response.HospitalResponse;
import com.service.hospital_service.dto.response.LocationResponse;
import com.service.hospital_service.entity.hospital.Hospital;
import com.service.hospital_service.entity.hospital.HospitalLocation;
import com.service.hospital_service.exception.NotFoundException;
import com.service.hospital_service.repository.HospitalLocationRepository;
import com.service.hospital_service.repository.HospitalRepository;
import com.service.hospital_service.service.abstraction.HospitalService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalLocationRepository hospitalLocationRepository;

    // CREATE
    @Override
    @Transactional
    public HospitalResponse registerHospital(HospitalRegistrationRequest request) {
        if (hospitalRepository.existsByName(request.getName())) {
            throw new NotFoundException("Hospital already exists with name: " + request.getName());
        }
        // Build and save Hospital first (no location yet, avoids transient error)

        Hospital newHospital = Hospital.builder()
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .website(request.getWebsite())
                .types(request.getTypes())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
        hospitalRepository.save(newHospital);

        // Build and save Location linked to Hospital
        HospitalLocation location = request.getLocation();
        location.setHospital(newHospital);
        hospitalLocationRepository.save(location);

        newHospital.setLocation(location);
        return mapToResponse(newHospital);
    }

    // READ ALL
    @Override
    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // READ ONE
    @Override
    public HospitalResponse getHospitalById(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hospital not found with id: " + id));
        return mapToResponse(hospital);
    }

    // UPDATE
    @Override
    @Transactional
    public HospitalResponse updateHospital(Long id, HospitalRegistrationRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hospital not found with id: " + id));

        // Check name conflict only if name is changing
        if (!hospital.getName().equals(request.getName())
                && hospitalRepository.existsByName(request.getName())) {
            throw new NotFoundException("Hospital already exists with name: " + request.getName());
        }

        hospital.setName(request.getName());
        hospital.setPhoneNumber(request.getPhoneNumber());
        hospital.setWebsite(request.getWebsite());
        hospital.setTypes(request.getTypes());
        hospital.setLatitude(request.getLatitude());
        hospital.setLongitude(request.getLongitude());

        // Update location if provided
        if (request.getLocation() != null) {
            HospitalLocation incoming = request.getLocation();
            HospitalLocation existing = hospital.getLocation();

            if (existing != null) {
                // Update in place
                existing.setAddress(incoming.getAddress());
                existing.setThana(incoming.getThana());
                existing.setPo(incoming.getPo());
                existing.setCity(incoming.getCity());
                existing.setPostalCode(incoming.getPostalCode());
                existing.setZoneId(incoming.getZoneId());
                existing.setLocationType(incoming.getLocationType());
                hospitalLocationRepository.save(existing);
            } else {
                // Create new location linked to hospital
                incoming.setHospital(hospital);
                hospitalLocationRepository.save(incoming);
                hospital.setLocation(incoming);
            }
        }

        hospitalRepository.save(hospital);
        return mapToResponse(hospital);
    }

    // DELETE
    @Override
    @Transactional
    public void deleteHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hospital not found with id: " + id));

        // Location is cascade deleted via CascadeType.ALL on Hospital.location
        hospitalRepository.delete(hospital);
    }

    // MAPPER
    private HospitalResponse mapToResponse(Hospital hospital) {
        LocationResponse locationResponse = null;
        if (hospital.getLocation() != null) {
            HospitalLocation loc = hospital.getLocation();
            locationResponse = LocationResponse.builder()
                    .id(loc.getId())
                    .locationType(loc.getLocationType())
                    .address(loc.getAddress())
                    .thana(loc.getThana())
                    .po(loc.getPo())
                    .city(loc.getCity())
                    .postalCode(loc.getPostalCode())
                    .zoneId(loc.getZoneId())
                    .build();
        }

        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .phoneNumber(hospital.getPhoneNumber())
                .website(hospital.getWebsite())
                .types(hospital.getTypes())
                .latitude(hospital.getLatitude())
                .longitude(hospital.getLongitude())
                .locationResponse(locationResponse)
                .build();
    }
}