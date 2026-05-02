package com.trustagro.finance.service;

import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.finance.dto.ProfitLossResponse;
import com.trustagro.finance.dto.TransactionRequest;
import com.trustagro.finance.dto.TransactionResponse;
import com.trustagro.finance.entity.FinanceTransaction;
import com.trustagro.finance.entity.TransactionType;
import com.trustagro.finance.repository.FinanceTransactionRepository;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FinanceTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public List<TransactionResponse> getAll() {
        return transactionRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TransactionResponse> getIncome() {
        return transactionRepository.findByTransactionType(TransactionType.INCOME)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TransactionResponse> getExpenses() {
        return transactionRepository.findByTransactionType(TransactionType.EXPENSE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TransactionResponse create(TransactionRequest req) {
        FinanceTransaction t = new FinanceTransaction();
        mapRequest(req, t);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(t::setRecordedBy);
        return toResponse(transactionRepository.save(t));
    }

    public void createAutoIncome(BigDecimal amount, String description, String referenceType, Long referenceId) {
        FinanceTransaction t = new FinanceTransaction();
        t.setTransactionType(TransactionType.INCOME);
        t.setCategory("PHARMACY_SALES");
        t.setAmount(amount);
        t.setDescription(description);
        t.setReferenceType(referenceType);
        t.setReferenceId(referenceId);
        t.setTransactionDate(LocalDate.now());
        transactionRepository.save(t);
    }

    public ProfitLossResponse getProfitLoss(LocalDate from, LocalDate to) {
        BigDecimal income = from != null
                ? transactionRepository.sumByTypeAndDateRange(TransactionType.INCOME, from, to)
                : transactionRepository.sumByType(TransactionType.INCOME);
        BigDecimal expenses = from != null
                ? transactionRepository.sumByTypeAndDateRange(TransactionType.EXPENSE, from, to)
                : transactionRepository.sumByType(TransactionType.EXPENSE);
        return new ProfitLossResponse(income, expenses, income.subtract(expenses));
    }

    private void mapRequest(TransactionRequest req, FinanceTransaction t) {
        t.setTransactionType(req.getTransactionType());
        t.setCategory(req.getCategory());
        t.setAmount(req.getAmount());
        t.setPaymentMethod(req.getPaymentMethod());
        t.setDepartment(req.getDepartment());
        t.setFarmId(req.getFarmId());
        t.setClientId(req.getClientId());
        t.setReferenceType(req.getReferenceType());
        t.setReferenceId(req.getReferenceId());
        t.setDescription(req.getDescription());
        t.setTransactionDate(req.getTransactionDate() != null ? req.getTransactionDate() : LocalDate.now());
    }

    public TransactionResponse toResponse(FinanceTransaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setId(t.getId());
        r.setTransactionType(t.getTransactionType());
        r.setCategory(t.getCategory());
        r.setAmount(t.getAmount());
        r.setPaymentMethod(t.getPaymentMethod());
        r.setDepartment(t.getDepartment());
        r.setFarmId(t.getFarmId());
        r.setClientId(t.getClientId());
        r.setReferenceType(t.getReferenceType());
        r.setReferenceId(t.getReferenceId());
        r.setDescription(t.getDescription());
        r.setTransactionDate(t.getTransactionDate());
        if (t.getRecordedBy() != null) r.setRecordedBy(t.getRecordedBy().getFullName());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }
}
