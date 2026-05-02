package com.trustagro.veterinary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PrescriptionRequest {
    @NotBlank private String prescriptionNumber;
    private Long farmId;
    private Long clientId;
    private Long diseaseCaseId;
    @NotBlank private String drugName;
    @NotNull private Double quantity;
    private String dosageInstruction;
}
