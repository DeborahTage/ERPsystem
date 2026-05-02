package com.trustagro.finance.dto;

import com.trustagro.finance.entity.PaymentMethod;
import com.trustagro.finance.entity.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TransactionResponse {
    private Long id;
    private TransactionType transactionType;
    private String category;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String department;
    private Long farmId;
    private Long clientId;
    private String referenceType;
    private Long referenceId;
    private String description;
    private LocalDate transactionDate;
    private String recordedBy;
    private LocalDateTime createdAt;
}
