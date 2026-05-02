package com.trustagro.finance.dto;

import com.trustagro.finance.entity.PaymentMethod;
import com.trustagro.finance.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotNull private TransactionType transactionType;
    @NotNull private String category;
    @NotNull @Positive private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String department;
    private Long farmId;
    private Long clientId;
    private String referenceType;
    private Long referenceId;
    private String description;
    private LocalDate transactionDate;
}
