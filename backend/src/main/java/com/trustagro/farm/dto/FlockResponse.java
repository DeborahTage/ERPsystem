package com.trustagro.farm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.trustagro.farm.entity.FlockStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FlockResponse {
    private Long id;
    private String batchCode;
    private Long farmId;
    private String farmName;
    private String type;
    private Integer initialCount;
    private Integer currentCount;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private FlockStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("birdType")
    public String getBirdType() {
        return type;
    }

    @JsonProperty("initialBirdCount")
    public Integer getInitialBirdCount() {
        return initialCount;
    }

    @JsonProperty("currentBirdCount")
    public Integer getCurrentBirdCount() {
        return currentCount;
    }
}
