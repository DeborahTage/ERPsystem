package com.trustagro.farm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DailyFarmRecordRequest {
    @NotNull
    private LocalDate date;
    @NotNull
    private Long farmId;
    @NotNull
    private Long flockId;
    private Integer openingBirdCount;
    @Min(0) private Integer mortality;
    @Min(0) private Integer culledBirds;
    @Min(0) private BigDecimal feedConsumed;
    @Min(0) private BigDecimal waterConsumed;
    private BigDecimal averageWeight;
    @Min(0) private Integer eggProduction;
    @Min(0) private Integer damagedEggs;
    private String symptomsOrRemarks;
}
