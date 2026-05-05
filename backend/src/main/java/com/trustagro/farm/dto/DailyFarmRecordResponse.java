package com.trustagro.farm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DailyFarmRecordResponse {
    private Long id;
    private LocalDate date;
    private Long farmId;
    private String farmName;
    private Long flockId;
    private String batchCode;
    private Integer openingBirdCount;
    private Integer mortality;
    private Integer culledBirds;
    private BigDecimal feedIntake;
    private BigDecimal waterIntake;
    private BigDecimal averageWeight;
    private Integer eggProduction;
    private Integer damagedEggs;
    private String remarks;
    private String recordedBy;
    private Double mortalityRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("feedConsumed")
    public BigDecimal getFeedConsumed() {
        return feedIntake;
    }

    @JsonProperty("waterConsumed")
    public BigDecimal getWaterConsumed() {
        return waterIntake;
    }

    @JsonProperty("symptomsOrRemarks")
    public String getSymptomsOrRemarks() {
        return remarks;
    }
}
