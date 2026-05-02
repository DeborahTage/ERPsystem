package com.trustagro.inventory.dto;

import com.trustagro.inventory.entity.ItemCategory;
import com.trustagro.inventory.entity.ItemStatus;
import com.trustagro.inventory.entity.ItemUnit;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryItemResponse {
    private Long id;
    private String itemName;
    private ItemCategory category;
    private ItemUnit unit;
    private Double minimumStockLevel;
    private boolean expiryRequired;
    private ItemStatus status;
    private Double currentStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
