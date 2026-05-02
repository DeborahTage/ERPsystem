package com.trustagro.farm.dto;

import com.trustagro.farm.entity.FarmType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FarmRequest {
    @NotBlank
    private String farmName;
    private String location;
    @NotNull
    private FarmType farmType;
    private Integer capacity;
    private Long assignedFarmManagerId;
}
