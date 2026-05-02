package com.trustagro.veterinary.repository;

import com.trustagro.veterinary.entity.VaccinationSchedule;
import com.trustagro.veterinary.entity.VaccinationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface VaccinationScheduleRepository extends JpaRepository<VaccinationSchedule, Long> {
    List<VaccinationSchedule> findByStatus(VaccinationStatus status);
    List<VaccinationSchedule> findByScheduledDateBeforeAndStatus(LocalDate date, VaccinationStatus status);
    List<VaccinationSchedule> findByScheduledDateAfterAndStatus(LocalDate date, VaccinationStatus status);
}
