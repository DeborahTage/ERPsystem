package com.trustagro.crm.dto;

import com.trustagro.crm.entity.ClientStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CrmClientResponse {
    private Long id;
    private String clientName;
    private String phone;
    private String location;
    private String farmType;
    private String farmSize;
    private Integer numberOfBirds;
    private ClientStatus status;
    private Long assignedExtensionWorkerId;
    private String assignedExtensionWorkerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
