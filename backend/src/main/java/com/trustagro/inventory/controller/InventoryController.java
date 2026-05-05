package com.trustagro.inventory.controller;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.inventory.dto.*;
import com.trustagro.inventory.entity.StockBatch;
import com.trustagro.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/items")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER','FARM_MANAGER','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getItems() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllItems()));
    }

    @GetMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER','FARM_MANAGER','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getItemById(id)));
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> createItem(@Valid @RequestBody InventoryItemRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Item created", inventoryService.createItem(req)));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> updateItem(@PathVariable Long id, @Valid @RequestBody InventoryItemRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Item updated", inventoryService.updateItem(id, req)));
    }

    @PostMapping("/stock-in")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER')")
    public ResponseEntity<ApiResponse<Void>> stockIn(@Valid @RequestBody StockInRequest req) {
        inventoryService.stockIn(req);
        return ResponseEntity.ok(ApiResponse.success("Stock recorded", null));
    }

    @PostMapping("/stock-out")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','FARM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> stockOut(@Valid @RequestBody StockOutRequest req) {
        inventoryService.stockOut(req);
        return ResponseEntity.ok(ApiResponse.success("Stock out recorded", null));
    }

    @GetMapping("/current-stock")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER','FARM_MANAGER','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getCurrentStock() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllItems()));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockItems()));
    }

    @GetMapping("/expiry-alerts")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<List<StockBatch>>> getExpiryAlerts() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getExpiringItems()));
    }
}
