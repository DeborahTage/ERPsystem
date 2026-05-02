package com.trustagro.veterinary.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TreatmentResponse {
    private Long id;
    private Long diseaseCaseId;
    private Long farmId;
    private String farmName;
    private Long flockId;
    private String batchCode;
    private String drugName;
    private String dosage;
    private String route;
    private String duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private String vetOfficer;
    private String outcome;
    private LocalDateTime createdAt;
}
