package com.trustagro.veterinary.repository;

import com.trustagro.veterinary.entity.DiseaseCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiseaseCaseRepository extends JpaRepository<DiseaseCase, Long> {
    List<DiseaseCase> findByFarmId(Long farmId);
}
