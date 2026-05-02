package com.trustagro.farm.dto;

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
    private String birdType;
    private Integer initialBirdCount;
    private Integer currentBirdCount;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private FlockStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
