package com.trustagro.farm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DailyFarmRecordRequest {
    @NotNull(message = "Date is required")
    private LocalDate date;
    @NotNull(message = "Farm id is required")
    private Long farmId;
    @NotNull(message = "Flock id is required")
    private Long flockId;
    @Min(value = 0, message = "Opening bird count must be zero or greater")
    private Integer openingBirdCount;
    @Min(value = 0, message = "Mortality must be zero or greater")
    private Integer mortality;
    @Min(value = 0, message = "Culled birds must be zero or greater")
    private Integer culledBirds;
    @DecimalMin(value = "0.0", message = "Feed intake must be zero or greater")
    @JsonAlias("feedConsumed")
    private BigDecimal feedIntake;
    @DecimalMin(value = "0.0", message = "Water intake must be zero or greater")
    @JsonAlias("waterConsumed")
    private BigDecimal waterIntake;
    @DecimalMin(value = "0.0", message = "Average weight must be zero or greater")
    private BigDecimal averageWeight;
    @Min(value = 0, message = "Egg production must be zero or greater")
    private Integer eggProduction;
    @Min(value = 0, message = "Damaged eggs must be zero or greater")
    private Integer damagedEggs;
    @JsonAlias("symptomsOrRemarks")
    private String remarks;
}
