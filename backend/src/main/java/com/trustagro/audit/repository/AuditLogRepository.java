package com.trustagro.audit.repository;

import com.trustagro.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByModuleOrderByCreatedAtDesc(String module);
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
