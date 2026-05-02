package com.trustagro.finance.controller;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.finance.dto.ProfitLossResponse;
import com.trustagro.finance.dto.TransactionRequest;
import com.trustagro.finance.dto.TransactionResponse;
import com.trustagro.finance.service.FinanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER','FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(financeService.getAll()));
    }

    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<TransactionResponse>> create(@Valid @RequestBody TransactionRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Transaction recorded", financeService.create(req)));
    }

    @GetMapping("/income")
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER','FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getIncome() {
        return ResponseEntity.ok(ApiResponse.success(financeService.getIncome()));
    }

    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER','FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getExpenses() {
        return ResponseEntity.ok(ApiResponse.success(financeService.getExpenses()));
    }

    @GetMapping("/profit-loss")
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER','FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<ProfitLossResponse>> getProfitLoss(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(financeService.getProfitLoss(from, to)));
    }
}
