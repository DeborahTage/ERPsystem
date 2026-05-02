package com.trustagro.veterinary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class VaccinationRequest {
    @NotNull private Long farmId;
    @NotNull private Long flockId;
    @NotBlank private String vaccineName;
    private String diseaseProtectedAgainst;
    @NotNull private LocalDate scheduledDate;
    private String remarks;
}
