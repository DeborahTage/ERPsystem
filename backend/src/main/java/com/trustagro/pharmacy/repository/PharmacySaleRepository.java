package com.trustagro.pharmacy.repository;

import com.trustagro.pharmacy.entity.PharmacySale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PharmacySaleRepository extends JpaRepository<PharmacySale, Long> {
    boolean existsByReceiptNumber(String receiptNumber);
    List<PharmacySale> findBySaleDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM PharmacySale s WHERE s.saleDate = :date")
    BigDecimal sumTotalByDate(@Param("date") LocalDate date);
}
