package com.trustagro.audit.controller;

import com.trustagro.audit.entity.AuditLog;
import com.trustagro.audit.service.AuditService;
import com.trustagro.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAll(@RequestParam(required = false) String module) {
        if (module != null) return ResponseEntity.ok(ApiResponse.success(auditService.getByModule(module)));
        return ResponseEntity.ok(ApiResponse.success(auditService.getAll()));
    }
}
