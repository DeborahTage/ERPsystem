package com.trustagro.farm.dto;

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
    private BigDecimal feedConsumed;
    private BigDecimal waterConsumed;
    private BigDecimal averageWeight;
    private Integer eggProduction;
    private Integer damagedEggs;
    private String symptomsOrRemarks;
    private String recordedBy;
    private Double mortalityRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
