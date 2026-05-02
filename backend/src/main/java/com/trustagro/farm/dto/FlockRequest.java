package com.trustagro.farm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FlockRequest {
    @NotBlank
    private String batchCode;
    @NotNull
    private Long farmId;
    private String birdType;
    private Integer initialBirdCount;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
}
