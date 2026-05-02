package com.trustagro.inventory.entity;

import com.trustagro.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Data
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @Enumerated(EnumType.STRING)
    private MovementType movementType;

    private Double quantity;
    private String reason;

    @Enumerated(EnumType.STRING)
    private IssuedToType issuedToType;

    private Long farmId;
    private String department;
    private String referenceType;
    private Long referenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    private LocalDate movementDate;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
