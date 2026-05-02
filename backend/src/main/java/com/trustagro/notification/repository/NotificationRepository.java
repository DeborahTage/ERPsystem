package com.trustagro.notification.repository;

import com.trustagro.notification.entity.Notification;
import com.trustagro.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrTargetUserIdOrderByCreatedAtDesc(Role role, Long userId);
    List<Notification> findByIsReadFalseAndTargetRoleOrIsReadFalseAndTargetUserId(Role role, Long userId);
}
