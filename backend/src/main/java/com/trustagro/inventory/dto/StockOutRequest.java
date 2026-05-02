package com.trustagro.inventory.dto;

import com.trustagro.inventory.entity.IssuedToType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StockOutRequest {
    @NotNull
    private Long itemId;
    @NotNull @Positive
    private Double quantity;
    private String reason;
    private IssuedToType issuedToType;
    private Long farmId;
    private String department;
    private String referenceType;
    private Long referenceId;
    private LocalDate movementDate;
}
