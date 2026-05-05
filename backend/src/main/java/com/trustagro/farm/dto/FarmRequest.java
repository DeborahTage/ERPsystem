package com.trustagro.farm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.trustagro.farm.entity.FarmType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class FarmRequest {
    @NotBlank(message = "Farm name is required")
    @JsonAlias("farmName")
    private String name;
    private String location;
    @NotNull(message = "Farm type is required")
    private FarmType farmType;
    @PositiveOrZero(message = "Capacity must be zero or greater")
    private Integer capacity;
    @JsonAlias("assignedFarmManagerId")
    private Long managerId;
}
