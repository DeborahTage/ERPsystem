package com.trustagro.crm.entity;

import com.trustagro.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_visits")
@Data
public class FarmVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private CrmClient client;

    private LocalDate visitDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visited_by")
    private User visitedBy;

    private String purpose;

    @Column(columnDefinition = "TEXT")
    private String observation;

    @Column(columnDefinition = "TEXT")
    private String adviceGiven;

    private LocalDate nextFollowUpDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
