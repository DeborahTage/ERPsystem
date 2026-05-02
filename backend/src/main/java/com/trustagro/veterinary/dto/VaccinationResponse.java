package com.trustagro.veterinary.dto;

import com.trustagro.veterinary.entity.VaccinationStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VaccinationResponse {
    private Long id;
    private Long farmId;
    private String farmName;
    private Long flockId;
    private String batchCode;
    private String vaccineName;
    private String diseaseProtectedAgainst;
    private LocalDate scheduledDate;
    private LocalDate actualDate;
    private VaccinationStatus status;
    private String givenBy;
    private String remarks;
    private LocalDateTime createdAt;
}
