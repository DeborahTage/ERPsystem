package com.trustagro.veterinary.dto;

import com.trustagro.veterinary.entity.PrescriptionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PrescriptionResponse {
    private Long id;
    private String prescriptionNumber;
    private Long farmId;
    private Long clientId;
    private Long diseaseCaseId;
    private String drugName;
    private Double quantity;
    private String dosageInstruction;
    private String createdByVet;
    private PrescriptionStatus status;
    private LocalDateTime createdAt;
}
