package com.trustagro.inventory.entity;

import com.trustagro.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_batches")
@Data
public class StockBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    private String batchNumber;
    private Double quantityReceived;
    private Double quantityRemaining;
    private BigDecimal unitCost;
    private String supplier;
    private LocalDate expiryDate;
    private LocalDate dateReceived;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by")
    private User receivedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
