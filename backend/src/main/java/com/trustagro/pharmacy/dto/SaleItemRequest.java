package com.trustagro.pharmacy.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaleItemRequest {
    @NotNull private Long inventoryItemId;
    @NotNull @Positive private Double quantity;
    @NotNull @Positive private BigDecimal unitPrice;
}
