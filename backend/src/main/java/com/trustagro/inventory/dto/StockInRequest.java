package com.trustagro.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class StockInRequest {
    @NotNull
    private Long itemId;
    private String batchNumber;
    @NotNull @Positive
    private Double quantity;
    private BigDecimal unitCost;
    private String supplier;
    private LocalDate expiryDate;
    private LocalDate dateReceived;
}
