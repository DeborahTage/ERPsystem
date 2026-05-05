package com.trustagro.notification.dto;

import com.trustagro.notification.entity.NotificationType;
import com.trustagro.user.entity.RoleName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private RoleName targetRole;
    private String relatedModule;
    private boolean isRead;
    private LocalDateTime createdAt;
}
