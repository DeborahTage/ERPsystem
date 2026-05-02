package com.trustagro.inventory.dto;

import com.trustagro.inventory.entity.ItemCategory;
import com.trustagro.inventory.entity.ItemUnit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryItemRequest {
    @NotBlank
    private String itemName;
    @NotNull
    private ItemCategory category;
    @NotNull
    private ItemUnit unit;
    private Double minimumStockLevel;
    private boolean expiryRequired;
}
