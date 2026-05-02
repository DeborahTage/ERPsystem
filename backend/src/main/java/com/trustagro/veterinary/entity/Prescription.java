package com.trustagro.veterinary.entity;

import com.trustagro.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String prescriptionNumber;

    private Long farmId;
    private Long clientId;
    private Long diseaseCaseId;

    private String drugName;
    private Double quantity;
    private String dosageInstruction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_vet")
    private User createdByVet;

    @Enumerated(EnumType.STRING)
    private PrescriptionStatus status = PrescriptionStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
