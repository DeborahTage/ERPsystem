package com.trustagro.notification.controller;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.notification.dto.NotificationResponse;
import com.trustagro.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getAll()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markRead(id)));
    }
}
