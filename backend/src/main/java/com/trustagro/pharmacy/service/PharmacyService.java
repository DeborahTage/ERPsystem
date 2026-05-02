package com.trustagro.pharmacy.service;

import com.trustagro.common.exception.BusinessException;
import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.finance.service.FinanceService;
import com.trustagro.inventory.dto.StockOutRequest;
import com.trustagro.inventory.entity.IssuedToType;
import com.trustagro.inventory.service.InventoryService;
import com.trustagro.pharmacy.dto.*;
import com.trustagro.pharmacy.entity.*;
import com.trustagro.pharmacy.repository.*;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final PharmacyCustomerRepository customerRepository;
    private final PharmacySaleRepository saleRepository;
    private final InventoryService inventoryService;
    private final FinanceService financeService;
    private final UserRepository userRepository;

    public List<PharmacyCustomer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public PharmacyCustomer createCustomer(CustomerRequest req) {
        PharmacyCustomer c = new PharmacyCustomer();
        c.setCustomerName(req.getCustomerName());
        c.setPhone(req.getPhone());
        c.setLocation(req.getLocation());
        c.setCustomerType(req.getCustomerType());
        return customerRepository.save(c);
    }

    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll().stream().map(this::toSaleResponse).collect(Collectors.toList());
    }

    @Transactional
    public SaleResponse createSale(SaleRequest req) {
        if (saleRepository.existsByReceiptNumber(req.getReceiptNumber()))
            throw new BusinessException("Receipt number already exists");

        PharmacySale sale = new PharmacySale();
        sale.setReceiptNumber(req.getReceiptNumber());
        sale.setSaleDate(req.getSaleDate() != null ? req.getSaleDate() : LocalDate.now());
        sale.setPaymentMethod(req.getPaymentMethod());
        sale.setPrescriptionId(req.getPrescriptionId());

        if (req.getCustomerId() != null)
            customerRepository.findById(req.getCustomerId()).ifPresent(sale::setCustomer);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(sale::setSoldBy);

        BigDecimal total = BigDecimal.ZERO;
        List<SaleItem> saleItems = new java.util.ArrayList<>();
        for (SaleItemRequest itemReq : req.getItems()) {
            StockOutRequest stockOut = new StockOutRequest();
            stockOut.setItemId(itemReq.getInventoryItemId());
            stockOut.setQuantity(itemReq.getQuantity());
            stockOut.setReason("Pharmacy Sale - " + req.getReceiptNumber());
            stockOut.setIssuedToType(IssuedToType.CUSTOMER);
            stockOut.setReferenceType("PHARMACY_SALE");
            inventoryService.stockOut(stockOut);

            SaleItem si = new SaleItem();
            si.setSale(sale);
            com.trustagro.inventory.entity.InventoryItem invItem = new com.trustagro.inventory.entity.InventoryItem();
            invItem.setId(itemReq.getInventoryItemId());
            si.setInventoryItem(invItem);
            si.setQuantity(itemReq.getQuantity());
            si.setUnitPrice(itemReq.getUnitPrice());
            BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            si.setTotalPrice(lineTotal);
            total = total.add(lineTotal);
            saleItems.add(si);
        }

        sale.setTotalAmount(total);
        sale.setItems(saleItems);
        PharmacySale saved = saleRepository.save(sale);

        // Auto-create finance income
        financeService.createAutoIncome(total, "Pharmacy Sale - " + req.getReceiptNumber(), "PHARMACY_SALE", saved.getId());

        return toSaleResponse(saved);
    }

    public SaleResponse getSaleById(Long id) {
        return toSaleResponse(saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found: " + id)));
    }

    private SaleResponse toSaleResponse(PharmacySale sale) {
        SaleResponse r = new SaleResponse();
        r.setId(sale.getId());
        r.setReceiptNumber(sale.getReceiptNumber());
        r.setSaleDate(sale.getSaleDate());
        r.setPaymentMethod(sale.getPaymentMethod());
        r.setTotalAmount(sale.getTotalAmount());
        r.setPrescriptionId(sale.getPrescriptionId());
        r.setCreatedAt(sale.getCreatedAt());
        if (sale.getCustomer() != null) {
            r.setCustomerId(sale.getCustomer().getId());
            r.setCustomerName(sale.getCustomer().getCustomerName());
        }
        if (sale.getSoldBy() != null) r.setSoldBy(sale.getSoldBy().getFullName());
        if (sale.getItems() != null) {
            r.setItems(sale.getItems().stream().map(si -> {
                SaleItemResponse sir = new SaleItemResponse();
                sir.setId(si.getId());
                sir.setQuantity(si.getQuantity());
                sir.setUnitPrice(si.getUnitPrice());
                sir.setTotalPrice(si.getTotalPrice());
                if (si.getInventoryItem() != null) {
                    sir.setInventoryItemId(si.getInventoryItem().getId());
                    sir.setItemName(si.getInventoryItem().getItemName());
                }
                return sir;
            }).collect(Collectors.toList()));
        }
        return r;
    }
}
