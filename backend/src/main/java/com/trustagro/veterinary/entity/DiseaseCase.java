package com.trustagro.veterinary.entity;

import com.trustagro.farm.entity.Farm;
import com.trustagro.farm.entity.Flock;
import com.trustagro.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "disease_cases")
@Data
public class DiseaseCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    private Farm farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flock_id")
    private Flock flock;

    private LocalDate dateDetected;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    private String suspectedDisease;
    private Integer numberAffected;
    private Integer numberDead;

    @Enumerated(EnumType.STRING)
    private DiseaseSeverity severity;

    @Enumerated(EnumType.STRING)
    private DiseaseStatus status = DiseaseStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
