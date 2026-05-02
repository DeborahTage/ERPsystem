package com.trustagro.veterinary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TreatmentRequest {
    private Long diseaseCaseId;
    @NotNull private Long farmId;
    @NotNull private Long flockId;
    @NotBlank private String drugName;
    private String dosage;
    private String route;
    private String duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private String outcome;
}
