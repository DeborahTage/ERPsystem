package com.trustagro.veterinary.dto;

import com.trustagro.veterinary.entity.DiseaseStatus;
import com.trustagro.veterinary.entity.DiseaseSeverity;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DiseaseCaseResponse {
    private Long id;
    private Long farmId;
    private String farmName;
    private Long flockId;
    private String batchCode;
    private LocalDate dateDetected;
    private String symptoms;
    private String suspectedDisease;
    private Integer numberAffected;
    private Integer numberDead;
    private DiseaseSeverity severity;
    private DiseaseStatus status;
    private String reportedBy;
    private LocalDateTime createdAt;
}
