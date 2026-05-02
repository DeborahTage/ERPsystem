package com.trustagro.finance.repository;

import com.trustagro.finance.entity.FinanceTransaction;
import com.trustagro.finance.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FinanceTransactionRepository extends JpaRepository<FinanceTransaction, Long> {
    List<FinanceTransaction> findByTransactionType(TransactionType type);
    List<FinanceTransaction> findByTransactionDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM FinanceTransaction t WHERE t.transactionType = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM FinanceTransaction t WHERE t.transactionType = :type AND t.transactionDate BETWEEN :from AND :to")
    BigDecimal sumByTypeAndDateRange(@Param("type") TransactionType type, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
