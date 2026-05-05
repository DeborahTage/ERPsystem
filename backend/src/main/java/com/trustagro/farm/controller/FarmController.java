package com.trustagro.farm.controller;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.farm.dto.DailyFarmRecordResponse;
import com.trustagro.farm.dto.FarmKpiResponse;
import com.trustagro.farm.dto.FarmRequest;
import com.trustagro.farm.dto.FarmResponse;
import com.trustagro.farm.entity.FarmStatus;
import com.trustagro.farm.service.DailyFarmRecordService;
import com.trustagro.farm.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;
    private final DailyFarmRecordService dailyFarmRecordService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FARM_MANAGER','VET','STORE')")
    public ResponseEntity<ApiResponse<List<FarmResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(farmService.getAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FARM_MANAGER','VET','STORE')")
    public ResponseEntity<ApiResponse<FarmResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(farmService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FarmResponse>> create(@Valid @RequestBody FarmRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Farm created", farmService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FarmResponse>> update(@PathVariable Long id, @Valid @RequestBody FarmRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Farm updated", farmService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FarmResponse>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(farmService.updateStatus(id, FarmStatus.valueOf(body.get("status")))));
    }

    @GetMapping("/{id}/daily-records")
    @PreAuthorize("hasAnyRole('ADMIN','FARM_MANAGER','VET')")
    public ResponseEntity<ApiResponse<List<DailyFarmRecordResponse>>> getDailyRecords(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dailyFarmRecordService.getByFarm(id)));
    }

    @GetMapping("/{id}/kpis")
    @PreAuthorize("hasAnyRole('ADMIN','FARM_MANAGER','VET')")
    public ResponseEntity<ApiResponse<FarmKpiResponse>> getKpis(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dailyFarmRecordService.getFarmKpis(id)));
    }
}
