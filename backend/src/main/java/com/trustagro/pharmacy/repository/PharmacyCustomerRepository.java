package com.trustagro.pharmacy.repository;

import com.trustagro.pharmacy.entity.PharmacyCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacyCustomerRepository extends JpaRepository<PharmacyCustomer, Long> {
}
