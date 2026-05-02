package com.trustagro.crm.repository;

import com.trustagro.crm.entity.FarmVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FarmVisitRepository extends JpaRepository<FarmVisit, Long> {
    List<FarmVisit> findByClientId(Long clientId);
    List<FarmVisit> findByNextFollowUpDateLessThanEqual(LocalDate date);
}
