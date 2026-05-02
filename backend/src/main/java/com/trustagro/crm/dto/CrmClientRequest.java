package com.trustagro.crm.dto;

import com.trustagro.crm.entity.ClientStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrmClientRequest {
    @NotBlank private String clientName;
    private String phone;
    private String location;
    private String farmType;
    private String farmSize;
    private Integer numberOfBirds;
    private ClientStatus status;
    private Long assignedExtensionWorkerId;
}
