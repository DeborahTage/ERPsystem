package com.trustagro.crm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FarmVisitRequest {
    @NotNull private Long clientId;
    private LocalDate visitDate;
    private String purpose;
    private String observation;
    private String adviceGiven;
    private LocalDate nextFollowUpDate;
}
