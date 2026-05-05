package com.trustagro.farm.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FarmKpiResponse {
    private Long farmId;
    private String farmName;
    private Integer totalInitialBirds;
    private Integer currentBirdCount;
    private Integer totalMortality;
    private Double mortalityRate;
    private BigDecimal totalFeedUsed;
    private BigDecimal totalWaterUsed;
    private Integer totalEggProduction;
    private Double averageEggProductionPerRecord;
    private BigDecimal feedUsedPerCurrentBird;
}
