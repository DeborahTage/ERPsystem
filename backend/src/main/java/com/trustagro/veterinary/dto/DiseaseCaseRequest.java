package com.trustagro.veterinary.dto;

import com.trustagro.veterinary.entity.DiseaseSeverity;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DiseaseCaseRequest {
    @NotNull private Long farmId;
    @NotNull private Long flockId;
    private LocalDate dateDetected;
    private String symptoms;
    private String suspectedDisease;
    private Integer numberAffected;
    private Integer numberDead;
    private DiseaseSeverity severity;
}
