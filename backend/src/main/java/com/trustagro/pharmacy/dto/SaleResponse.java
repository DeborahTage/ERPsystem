package com.trustagro.pharmacy.dto;

import com.trustagro.finance.entity.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SaleResponse {
    private Long id;
    private String receiptNumber;
    private Long customerId;
    private String customerName;
    private LocalDate saleDate;
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private String soldBy;
    private Long prescriptionId;
    private List<SaleItemResponse> items;
    private LocalDateTime createdAt;
}
