package com.trustagro.pharmacy.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaleItemResponse {
    private Long id;
    private Long inventoryItemId;
    private String itemName;
    private Double quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
