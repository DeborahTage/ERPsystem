package com.trustagro.notification.repository;

import com.trustagro.notification.entity.Notification;
import com.trustagro.user.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrTargetUserIdOrderByCreatedAtDesc(RoleName roleName, Long userId);
    List<Notification> findByIsReadFalseAndTargetRoleOrIsReadFalseAndTargetUserId(RoleName roleName, Long userId);
}
