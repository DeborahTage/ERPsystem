package com.trustagro.veterinary.service;

import com.trustagro.common.exception.BusinessException;
import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.farm.repository.FarmRepository;
import com.trustagro.farm.repository.FlockRepository;
import com.trustagro.veterinary.dto.*;
import com.trustagro.veterinary.entity.*;
import com.trustagro.veterinary.repository.*;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VeterinaryService {

    private final VaccinationScheduleRepository vaccinationRepo;
    private final DiseaseCaseRepository diseaseCaseRepo;
    private final TreatmentRecordRepository treatmentRepo;
    private final PrescriptionRepository prescriptionRepo;
    private final FarmRepository farmRepository;
    private final FlockRepository flockRepository;
    private final UserRepository userRepository;

    // Vaccinations
    public List<VaccinationResponse> getAllVaccinations() {
        return vaccinationRepo.findAll().stream().map(this::toVaccinationResponse).collect(Collectors.toList());
    }

    public VaccinationResponse createVaccination(VaccinationRequest req) {
        VaccinationSchedule v = new VaccinationSchedule();
        v.setFarm(farmRepository.findById(req.getFarmId()).orElseThrow(() -> new ResourceNotFoundException("Farm not found")));
        v.setFlock(flockRepository.findById(req.getFlockId()).orElseThrow(() -> new ResourceNotFoundException("Flock not found")));
        v.setVaccineName(req.getVaccineName());
        v.setDiseaseProtectedAgainst(req.getDiseaseProtectedAgainst());
        v.setScheduledDate(req.getScheduledDate());
        v.setRemarks(req.getRemarks());
        return toVaccinationResponse(vaccinationRepo.save(v));
    }

    public VaccinationResponse completeVaccination(Long id) {
        VaccinationSchedule v = vaccinationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination not found"));
        v.setStatus(VaccinationStatus.COMPLETED);
        v.setActualDate(LocalDate.now());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(v::setGivenBy);
        return toVaccinationResponse(vaccinationRepo.save(v));
    }

    // Disease Cases
    public List<DiseaseCaseResponse> getAllDiseaseCases() {
        return diseaseCaseRepo.findAll().stream().map(this::toDiseaseCaseResponse).collect(Collectors.toList());
    }

    public DiseaseCaseResponse createDiseaseCase(DiseaseCaseRequest req) {
        DiseaseCase dc = new DiseaseCase();
        dc.setFarm(farmRepository.findById(req.getFarmId()).orElseThrow(() -> new ResourceNotFoundException("Farm not found")));
        dc.setFlock(flockRepository.findById(req.getFlockId()).orElseThrow(() -> new ResourceNotFoundException("Flock not found")));
        dc.setDateDetected(req.getDateDetected() != null ? req.getDateDetected() : LocalDate.now());
        dc.setSymptoms(req.getSymptoms());
        dc.setSuspectedDisease(req.getSuspectedDisease());
        dc.setNumberAffected(req.getNumberAffected());
        dc.setNumberDead(req.getNumberDead());
        dc.setSeverity(req.getSeverity());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(dc::setReportedBy);
        return toDiseaseCaseResponse(diseaseCaseRepo.save(dc));
    }

    public DiseaseCaseResponse updateDiseaseCase(Long id, DiseaseCaseRequest req) {
        DiseaseCase dc = diseaseCaseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disease case not found"));
        dc.setSymptoms(req.getSymptoms());
        dc.setSuspectedDisease(req.getSuspectedDisease());
        dc.setNumberAffected(req.getNumberAffected());
        dc.setNumberDead(req.getNumberDead());
        dc.setSeverity(req.getSeverity());
        return toDiseaseCaseResponse(diseaseCaseRepo.save(dc));
    }

    // Treatments
    public List<TreatmentResponse> getAllTreatments() {
        return treatmentRepo.findAll().stream().map(this::toTreatmentResponse).collect(Collectors.toList());
    }

    public TreatmentResponse createTreatment(TreatmentRequest req) {
        TreatmentRecord t = new TreatmentRecord();
        if (req.getDiseaseCaseId() != null)
            t.setDiseaseCase(diseaseCaseRepo.findById(req.getDiseaseCaseId()).orElse(null));
        t.setFarm(farmRepository.findById(req.getFarmId()).orElseThrow(() -> new ResourceNotFoundException("Farm not found")));
        t.setFlock(flockRepository.findById(req.getFlockId()).orElseThrow(() -> new ResourceNotFoundException("Flock not found")));
        t.setDrugName(req.getDrugName());
        t.setDosage(req.getDosage());
        t.setRoute(req.getRoute());
        t.setDuration(req.getDuration());
        t.setStartDate(req.getStartDate());
        t.setEndDate(req.getEndDate());
        t.setOutcome(req.getOutcome());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(t::setVetOfficer);
        return toTreatmentResponse(treatmentRepo.save(t));
    }

    // Prescriptions
    public List<PrescriptionResponse> getAllPrescriptions() {
        return prescriptionRepo.findAll().stream().map(this::toPrescriptionResponse).collect(Collectors.toList());
    }

    public PrescriptionResponse createPrescription(PrescriptionRequest req) {
        if (prescriptionRepo.existsByPrescriptionNumber(req.getPrescriptionNumber()))
            throw new BusinessException("Prescription number already exists");
        Prescription p = new Prescription();
        p.setPrescriptionNumber(req.getPrescriptionNumber());
        p.setFarmId(req.getFarmId());
        p.setClientId(req.getClientId());
        p.setDiseaseCaseId(req.getDiseaseCaseId());
        p.setDrugName(req.getDrugName());
        p.setQuantity(req.getQuantity());
        p.setDosageInstruction(req.getDosageInstruction());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(p::setCreatedByVet);
        return toPrescriptionResponse(prescriptionRepo.save(p));
    }

    public PrescriptionResponse dispensePrescription(Long id) {
        Prescription p = prescriptionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
        if (p.getStatus() == PrescriptionStatus.CANCELLED)
            throw new BusinessException("Prescription is cancelled");
        p.setStatus(PrescriptionStatus.DISPENSED);
        return toPrescriptionResponse(prescriptionRepo.save(p));
    }

    private VaccinationResponse toVaccinationResponse(VaccinationSchedule v) {
        VaccinationResponse r = new VaccinationResponse();
        r.setId(v.getId());
        if (v.getFarm() != null) { r.setFarmId(v.getFarm().getId()); r.setFarmName(v.getFarm().getFarmName()); }
        if (v.getFlock() != null) { r.setFlockId(v.getFlock().getId()); r.setBatchCode(v.getFlock().getBatchCode()); }
        r.setVaccineName(v.getVaccineName());
        r.setDiseaseProtectedAgainst(v.getDiseaseProtectedAgainst());
        r.setScheduledDate(v.getScheduledDate());
        r.setActualDate(v.getActualDate());
        r.setStatus(v.getStatus());
        if (v.getGivenBy() != null) r.setGivenBy(v.getGivenBy().getFullName());
        r.setRemarks(v.getRemarks());
        r.setCreatedAt(v.getCreatedAt());
        return r;
    }

    private DiseaseCaseResponse toDiseaseCaseResponse(DiseaseCase dc) {
        DiseaseCaseResponse r = new DiseaseCaseResponse();
        r.setId(dc.getId());
        if (dc.getFarm() != null) { r.setFarmId(dc.getFarm().getId()); r.setFarmName(dc.getFarm().getFarmName()); }
        if (dc.getFlock() != null) { r.setFlockId(dc.getFlock().getId()); r.setBatchCode(dc.getFlock().getBatchCode()); }
        r.setDateDetected(dc.getDateDetected());
        r.setSymptoms(dc.getSymptoms());
        r.setSuspectedDisease(dc.getSuspectedDisease());
        r.setNumberAffected(dc.getNumberAffected());
        r.setNumberDead(dc.getNumberDead());
        r.setSeverity(dc.getSeverity());
        r.setStatus(dc.getStatus());
        if (dc.getReportedBy() != null) r.setReportedBy(dc.getReportedBy().getFullName());
        r.setCreatedAt(dc.getCreatedAt());
        return r;
    }

    private TreatmentResponse toTreatmentResponse(TreatmentRecord t) {
        TreatmentResponse r = new TreatmentResponse();
        r.setId(t.getId());
        if (t.getDiseaseCase() != null) r.setDiseaseCaseId(t.getDiseaseCase().getId());
        if (t.getFarm() != null) { r.setFarmId(t.getFarm().getId()); r.setFarmName(t.getFarm().getFarmName()); }
        if (t.getFlock() != null) { r.setFlockId(t.getFlock().getId()); r.setBatchCode(t.getFlock().getBatchCode()); }
        r.setDrugName(t.getDrugName());
        r.setDosage(t.getDosage());
        r.setRoute(t.getRoute());
        r.setDuration(t.getDuration());
        r.setStartDate(t.getStartDate());
        r.setEndDate(t.getEndDate());
        if (t.getVetOfficer() != null) r.setVetOfficer(t.getVetOfficer().getFullName());
        r.setOutcome(t.getOutcome());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }

    private PrescriptionResponse toPrescriptionResponse(Prescription p) {
        PrescriptionResponse r = new PrescriptionResponse();
        r.setId(p.getId());
        r.setPrescriptionNumber(p.getPrescriptionNumber());
        r.setFarmId(p.getFarmId());
        r.setClientId(p.getClientId());
        r.setDiseaseCaseId(p.getDiseaseCaseId());
        r.setDrugName(p.getDrugName());
        r.setQuantity(p.getQuantity());
        r.setDosageInstruction(p.getDosageInstruction());
        if (p.getCreatedByVet() != null) r.setCreatedByVet(p.getCreatedByVet().getFullName());
        r.setStatus(p.getStatus());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}
