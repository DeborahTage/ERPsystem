package com.trustagro.veterinary.controller;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.veterinary.dto.*;
import com.trustagro.veterinary.service.VeterinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vet")
@RequiredArgsConstructor
public class VeterinaryController {

    private final VeterinaryService vetService;

    @GetMapping("/vaccinations")
    public ResponseEntity<ApiResponse<List<VaccinationResponse>>> getVaccinations() {
        return ResponseEntity.ok(ApiResponse.success(vetService.getAllVaccinations()));
    }

    @PostMapping("/vaccinations")
    @PreAuthorize("hasAnyRole('ADMIN','VETERINARY_OFFICER')")
    public ResponseEntity<ApiResponse<VaccinationResponse>> createVaccination(@Valid @RequestBody VaccinationRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Vaccination scheduled", vetService.createVaccination(req)));
    }

    @PatchMapping("/vaccinations/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','VETERINARY_OFFICER')")
    public ResponseEntity<ApiResponse<VaccinationResponse>> completeVaccination(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Vaccination completed", vetService.completeVaccination(id)));
    }

    @GetMapping("/disease-cases")
    public ResponseEntity<ApiResponse<List<DiseaseCaseResponse>>> getDiseaseCases() {
        return ResponseEntity.ok(ApiResponse.success(vetService.getAllDiseaseCases()));
    }

    @PostMapping("/disease-cases")
    @PreAuthorize("hasAnyRole('ADMIN','VETERINARY_OFFICER','FARM_MANAGER')")
    public ResponseEntity<ApiResponse<DiseaseCaseResponse>> createDiseaseCase(@Valid @RequestBody DiseaseCaseRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Disease case recorded", vetService.createDiseaseCase(req)));
    }

    @PutMapping("/disease-cases/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VETERINARY_OFFICER')")
    public ResponseEntity<ApiResponse<DiseaseCaseResponse>> updateDiseaseCase(@PathVariable Long id, @Valid @RequestBody DiseaseCaseRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Disease case updated", vetService.updateDiseaseCase(id, req)));
    }

    @GetMapping("/treatments")
    public ResponseEntity<ApiResponse<List<TreatmentResponse>>> getTreatments() {
        return ResponseEntity.ok(ApiResponse.success(vetService.getAllTreatments()));
    }

    @PostMapping("/treatments")
    @PreAuthorize("hasAnyRole('ADMIN','VETERINARY_OFFICER')")
    public ResponseEntity<ApiResponse<TreatmentResponse>> createTreatment(@Valid @RequestBody TreatmentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Treatment recorded", vetService.createTreatment(req)));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPrescriptions() {
        return ResponseEntity.ok(ApiResponse.success(vetService.getAllPrescriptions()));
    }

    @PostMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('ADMIN','VETERINARY_OFFICER')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(@Valid @RequestBody PrescriptionRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Prescription created", vetService.createPrescription(req)));
    }

    @PatchMapping("/prescriptions/{id}/dispense")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> dispensePrescription(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Prescription dispensed", vetService.dispensePrescription(id)));
    }
}
