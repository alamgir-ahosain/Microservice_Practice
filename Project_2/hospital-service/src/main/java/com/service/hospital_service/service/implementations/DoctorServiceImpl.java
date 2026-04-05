package com.service.hospital_service.service.implementations;

import com.service.hospital_service.dto.data.Location;
import com.service.hospital_service.dto.request.DoctorRegistrationRequest;
import com.service.hospital_service.dto.response.DoctorHospitalResponse;
import com.service.hospital_service.dto.response.DoctorResponse;
import com.service.hospital_service.dto.response.LocationResponse;
import com.service.hospital_service.entity.doctor.Doctor;
import com.service.hospital_service.entity.doctor.DoctorHospital;
import com.service.hospital_service.entity.doctor.DoctorLocation;
import com.service.hospital_service.entity.hospital.Hospital;
import com.service.hospital_service.exception.NotFoundException;
import com.service.hospital_service.repository.DoctorHospitalRepository;
import com.service.hospital_service.repository.DoctorLocationRepository;
import com.service.hospital_service.repository.DoctorRepository;
import com.service.hospital_service.repository.HospitalRepository;
import com.service.hospital_service.service.abstraction.DoctorService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

        private final DoctorRepository doctorRepository;
        private final DoctorLocationRepository doctorLocationRepository;
        private final DoctorHospitalRepository doctorHospitalRepository;
        private final HospitalRepository hospitalRepository;

        // ─── CREATE ───────────────────────────────────────────────────────────────

        @Override
        @Transactional
        public DoctorResponse createDoctor(DoctorRegistrationRequest request) {
                // DoctorRegistrationRequest is a CLASS → use .getName(), .getLocation() etc.
                // Location is a RECORD → use .address(), .city() etc.
                Doctor doctor = Doctor.builder()
                                .name(request.getName())
                                .specialties(request.getSpecialties())
                                .phoneNumber(request.getPhoneNumber())
                                .email(request.getEmail())
                                .build();
                doctorRepository.save(doctor);

                if (request.getLocation() != null) {
                        Location loc = request.getLocation();
                        DoctorLocation doctorLocation = DoctorLocation.builder()
                                        .doctor(doctor)
                                        .address(loc.getAddress())
                                        .thana(loc.getThana())
                                        .po(loc.getPo())
                                        .city(loc.getCity())
                                        .postalCode(loc.getPostalCode())
                                        .zoneId(loc.getZoneId())
                                        .locationType(loc.getLocationType())
                                        .build();
                        doctorLocationRepository.save(doctorLocation);
                        doctor.setLocationId(doctorLocation.getId());
                        doctorRepository.save(doctor);
                }

                if (request.getDoctorHospitals() != null && !request.getDoctorHospitals().isEmpty()) {
                        request.getDoctorHospitals().forEach(dhr -> {
                                Hospital hospital = hospitalRepository.findById(dhr.hospitalId())
                                                .orElseThrow(() -> new NotFoundException(
                                                                "Hospital not found with id: " + dhr.hospitalId()));
                                DoctorHospital link = DoctorHospital.builder()
                                                .doctor(doctor).hospital(hospital).build();
                                doctorHospitalRepository.save(link);
                                doctor.getDoctorHospitals().add(link);
                        });
                }

                return mapToResponse(doctor);
        }

        // ─── READ ALL ─────────────────────────────────────────────────────────────

        @Override
        public List<DoctorResponse> getAllDoctors() {
                return doctorRepository.findAll().stream().map(this::mapToResponse).toList();
        }

        // ─── READ ONE ─────────────────────────────────────────────────────────────

        @Override
        public DoctorResponse getDoctorById(Long id) {
                return mapToResponse(doctorRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + id)));
        }

        // ─── UPDATE ───────────────────────────────────────────────────────────────

        @Override
        @Transactional
        public DoctorResponse updateDoctor(Long id, DoctorRegistrationRequest request) {
                Doctor doctor = doctorRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + id));

                doctor.setName(request.getName());
                doctor.setSpecialties(request.getSpecialties());
                doctor.setPhoneNumber(request.getPhoneNumber());
                doctor.setEmail(request.getEmail());

                if (request.getLocation() != null) {
                        Location loc = request.getLocation();
                        DoctorLocation existing = (doctor.getLocationId() != null)
                                        ? doctorLocationRepository.findById(doctor.getLocationId()).orElse(null)
                                        : null;

                        if (existing != null) {
                                existing.setAddress(loc.getAddress());
                                existing.setThana(loc.getThana());
                                existing.setPo(loc.getPo());
                                existing.setCity(loc.getCity());
                                existing.setPostalCode(loc.getPostalCode());
                                existing.setZoneId(loc.getZoneId());
                                existing.setLocationType(loc.getLocationType());
                                doctorLocationRepository.save(existing);
                        } else {
                                DoctorLocation newLoc = DoctorLocation.builder()
                                                .doctor(doctor)
                                                .address(loc.getAddress()).thana(loc.getThana()).po(loc.getPo())
                                                .city(loc.getCity())
                                                .postalCode(loc.getPostalCode()).zoneId(loc.getZoneId())
                                                .locationType(loc.getLocationType())
                                                .build();
                                doctorLocationRepository.save(newLoc);
                                doctor.setLocationId(newLoc.getId());
                        }
                }

                if (request.getDoctorHospitals() != null) {
                        doctorHospitalRepository.deleteAll(doctor.getDoctorHospitals());
                        doctor.getDoctorHospitals().clear();
                        List<DoctorHospital> newLinks = new ArrayList<>();
                        request.getDoctorHospitals().forEach(dhr -> {
                                Hospital hospital = hospitalRepository.findById(dhr.hospitalId())
                                                .orElseThrow(() -> new NotFoundException(
                                                                "Hospital not found: " + dhr.hospitalId()));
                                newLinks.add(doctorHospitalRepository.save(
                                                DoctorHospital.builder().doctor(doctor).hospital(hospital).build()));
                        });
                        doctor.getDoctorHospitals().addAll(newLinks);
                }

                doctorRepository.save(doctor);
                return mapToResponse(doctor);
        }

        // ─── DELETE ───────────────────────────────────────────────────────────────

        @Override
        @Transactional
        public void deleteDoctor(Long id) {
                doctorRepository.delete(doctorRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + id)));
        }

        // ─── MAPPER ───────────────────────────────────────────────────────────────

        private DoctorResponse mapToResponse(Doctor doctor) {
                LocationResponse locationResponse = null;
                if (doctor.getLocationId() != null) {
                        locationResponse = doctorLocationRepository.findById(doctor.getLocationId())
                                        .map(loc -> LocationResponse.builder()
                                                        .id(loc.getId()).locationType(loc.getLocationType())
                                                        .address(loc.getAddress()).thana(loc.getThana()).po(loc.getPo())
                                                        .city(loc.getCity()).postalCode(loc.getPostalCode())
                                                        .zoneId(loc.getZoneId())
                                                        .build())
                                        .orElse(null);
                }
                List<DoctorHospitalResponse> hospitalResponses = doctor.getDoctorHospitals().stream()
                                .map(dh -> DoctorHospitalResponse.builder()
                                                .id(dh.getId()).hospitalId(dh.getHospital().getId())
                                                .hospitalName(dh.getHospital().getName()).build())
                                .toList();
                return DoctorResponse.builder()
                                .id(doctor.getId()).name(doctor.getName()).specialties(doctor.getSpecialties())
                                .phoneNumber(doctor.getPhoneNumber()).email(doctor.getEmail())
                                .locationResponse(locationResponse).doctorHospitals(hospitalResponses).build();
        }
}