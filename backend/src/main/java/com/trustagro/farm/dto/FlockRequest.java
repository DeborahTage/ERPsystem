package com.trustagro.farm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FlockRequest {
    @NotBlank(message = "Batch code is required")
    private String batchCode;
    @NotNull(message = "Farm id is required")
    private Long farmId;
    @NotBlank(message = "Flock type is required")
    @JsonAlias("birdType")
    private String type;
    @NotNull(message = "Initial count is required")
    @Positive(message = "Initial count must be greater than zero")
    @JsonAlias("initialBirdCount")
    private Integer initialCount;
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    private LocalDate expectedEndDate;
}
