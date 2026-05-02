package com.trustagro.config;

import com.trustagro.notification.service.NotificationService;
import com.trustagro.veterinary.entity.VaccinationSchedule;
import com.trustagro.veterinary.entity.VaccinationStatus;
import com.trustagro.veterinary.repository.VaccinationScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final VaccinationScheduleRepository vaccinationRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 6 * * *")
    public void checkMissedVaccinations() {
        List<VaccinationSchedule> missed = vaccinationRepository
                .findByScheduledDateBeforeAndStatus(LocalDate.now(), VaccinationStatus.SCHEDULED);
        for (VaccinationSchedule v : missed) {
            v.setStatus(VaccinationStatus.MISSED);
            vaccinationRepository.save(v);
            String farmName = v.getFarm() != null ? v.getFarm().getFarmName() : "Unknown";
            notificationService.createMissedVaccinationAlert(farmName, v.getVaccineName());
            log.info("Marked vaccination as MISSED: {} for farm {}", v.getVaccineName(), farmName);
        }
    }
}
