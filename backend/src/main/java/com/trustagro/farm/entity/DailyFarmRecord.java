package com.trustagro.farm.entity;

import com.trustagro.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_farm_records", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"farm_id", "flock_id", "date"})
})
@Data
public class DailyFarmRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flock_id", nullable = false)
    private Flock flock;

    private Integer openingBirdCount;
    private Integer mortality;
    private Integer culledBirds;
    private BigDecimal feedConsumed;
    private BigDecimal waterConsumed;
    private BigDecimal averageWeight;
    private Integer eggProduction;
    private Integer damagedEggs;
    private String symptomsOrRemarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
