package com.trustagro.crm.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FarmVisitResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private LocalDate visitDate;
    private String visitedBy;
    private String purpose;
    private String observation;
    private String adviceGiven;
    private LocalDate nextFollowUpDate;
    private LocalDateTime createdAt;
}
