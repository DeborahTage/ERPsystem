package com.trustagro.veterinary.repository;

import com.trustagro.veterinary.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {
    List<TreatmentRecord> findByDiseaseCaseId(Long diseaseCaseId);
}
