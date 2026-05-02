package com.trustagro.farm.dto;

import com.trustagro.farm.entity.FarmStatus;
import com.trustagro.farm.entity.FarmType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FarmResponse {
    private Long id;
    private String farmName;
    private String location;
    private FarmType farmType;
    private Integer capacity;
    private Long assignedFarmManagerId;
    private String assignedFarmManagerName;
    private FarmStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
