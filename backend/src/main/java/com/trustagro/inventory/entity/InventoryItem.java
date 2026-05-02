package com.trustagro.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Data
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemName;

    @Enumerated(EnumType.STRING)
    private ItemCategory category;

    @Enumerated(EnumType.STRING)
    private ItemUnit unit;

    private Double minimumStockLevel;

    private boolean expiryRequired;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.ACTIVE;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
