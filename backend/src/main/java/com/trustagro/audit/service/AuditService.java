package com.trustagro.audit.service;

import com.trustagro.audit.entity.AuditLog;
import com.trustagro.audit.repository.AuditLogRepository;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(String action, String module, Long recordId, String oldValue, String newValue) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setModule(module);
        log.setRecordId(recordId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            log.setUserEmail(email);
            userRepository.findByEmail(email).ifPresent(u -> log.setUserId(u.getId()));
        } catch (Exception ignored) {}
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAll() {
        return auditLogRepository.findAll();
    }

    public List<AuditLog> getByModule(String module) {
        return auditLogRepository.findByModuleOrderByCreatedAtDesc(module);
    }
}
