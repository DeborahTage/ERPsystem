package com.trustagro.pharmacy.controller;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.pharmacy.dto.*;
import com.trustagro.pharmacy.entity.PharmacyCustomer;
import com.trustagro.pharmacy.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<PharmacyCustomer>>> getCustomers() {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.getAllCustomers()));
    }

    @PostMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<PharmacyCustomer>> createCustomer(@Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Customer created", pharmacyService.createCustomer(req)));
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_SALES','FINANCE_OFFICER','GENERAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getSales() {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.getAllSales()));
    }

    @PostMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<SaleResponse>> createSale(@Valid @RequestBody SaleRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Sale completed", pharmacyService.createSale(req)));
    }

    @GetMapping("/sales/{id}/receipt")
    public ResponseEntity<ApiResponse<SaleResponse>> getReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(pharmacyService.getSaleById(id)));
    }
}
