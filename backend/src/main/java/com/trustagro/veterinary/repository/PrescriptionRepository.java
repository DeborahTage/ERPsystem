package com.trustagro.veterinary.repository;

import com.trustagro.veterinary.entity.Prescription;
import com.trustagro.veterinary.entity.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByStatus(PrescriptionStatus status);
    boolean existsByPrescriptionNumber(String prescriptionNumber);
}
