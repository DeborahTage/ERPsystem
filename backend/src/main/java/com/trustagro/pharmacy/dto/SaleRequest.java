package com.trustagro.pharmacy.dto;

import com.trustagro.finance.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class SaleRequest {
    @NotBlank private String receiptNumber;
    private Long customerId;
    private LocalDate saleDate;
    private PaymentMethod paymentMethod;
    private Long prescriptionId;
    @NotEmpty private List<SaleItemRequest> items;
}
