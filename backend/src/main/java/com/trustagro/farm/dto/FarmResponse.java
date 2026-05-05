package com.trustagro.farm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.trustagro.farm.entity.FarmStatus;
import com.trustagro.farm.entity.FarmType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FarmResponse {
    private Long id;
    private String name;
    private String location;
    private FarmType farmType;
    private Integer capacity;
    private Long managerId;
    private String managerName;
    private FarmStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("farmName")
    public String getFarmName() {
        return name;
    }

    @JsonProperty("assignedFarmManagerId")
    public Long getAssignedFarmManagerId() {
        return managerId;
    }

    @JsonProperty("assignedFarmManagerName")
    public String getAssignedFarmManagerName() {
        return managerName;
    }
}
