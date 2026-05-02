package com.trustagro.farm.controller;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.farm.dto.FlockRequest;
import com.trustagro.farm.dto.FlockResponse;
import com.trustagro.farm.service.FlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flocks")
@RequiredArgsConstructor
public class FlockController {

    private final FlockService flockService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlockResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(flockService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlockResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(flockService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER','OPERATIONS_MANAGER','FARM_MANAGER')")
    public ResponseEntity<ApiResponse<FlockResponse>> create(@Valid @RequestBody FlockRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Flock created", flockService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER','FARM_MANAGER')")
    public ResponseEntity<ApiResponse<FlockResponse>> update(@PathVariable Long id, @Valid @RequestBody FlockRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Flock updated", flockService.update(id, req)));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER','FARM_MANAGER')")
    public ResponseEntity<ApiResponse<FlockResponse>> close(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Flock closed", flockService.close(id)));
    }
}
