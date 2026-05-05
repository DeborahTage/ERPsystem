package com.trustagro.notification.entity;

import com.trustagro.user.entity.RoleName;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.INFO;

    @Enumerated(EnumType.STRING)
    private RoleName targetRole;

    private Long targetUserId;

    private String relatedModule;

    private Long relatedId;

    private boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
