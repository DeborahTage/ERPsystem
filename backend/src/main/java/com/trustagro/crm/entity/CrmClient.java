package com.trustagro.crm.entity;

import com.trustagro.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "crm_clients")
@Data
public class CrmClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;

    private String phone;
    private String location;
    private String farmType;
    private String farmSize;
    private Integer numberOfBirds;

    @Enumerated(EnumType.STRING)
    private ClientStatus status = ClientStatus.LEAD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_extension_worker_id")
    private User assignedExtensionWorker;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
