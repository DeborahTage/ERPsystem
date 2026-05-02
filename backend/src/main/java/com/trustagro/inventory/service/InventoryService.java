package com.trustagro.inventory.service;

import com.trustagro.common.exception.BusinessException;
import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.inventory.dto.*;
import com.trustagro.inventory.entity.*;
import com.trustagro.inventory.repository.*;
import com.trustagro.notification.service.NotificationService;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository itemRepository;
    private final StockBatchRepository batchRepository;
    private final StockMovementRepository movementRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.alerts.expiry-warning-days}")
    private int expiryWarningDays;

    public List<InventoryItemResponse> getAllItems() {
        return itemRepository.findAll().stream().map(this::toItemResponse).collect(Collectors.toList());
    }

    public InventoryItemResponse getItemById(Long id) {
        return toItemResponse(findItemById(id));
    }

    public InventoryItemResponse createItem(InventoryItemRequest req) {
        InventoryItem item = new InventoryItem();
        item.setItemName(req.getItemName());
        item.setCategory(req.getCategory());
        item.setUnit(req.getUnit());
        item.setMinimumStockLevel(req.getMinimumStockLevel());
        item.setExpiryRequired(req.isExpiryRequired());
        return toItemResponse(itemRepository.save(item));
    }

    public InventoryItemResponse updateItem(Long id, InventoryItemRequest req) {
        InventoryItem item = findItemById(id);
        item.setItemName(req.getItemName());
        item.setCategory(req.getCategory());
        item.setUnit(req.getUnit());
        item.setMinimumStockLevel(req.getMinimumStockLevel());
        item.setExpiryRequired(req.isExpiryRequired());
        return toItemResponse(itemRepository.save(item));
    }

    @Transactional
    public void stockIn(StockInRequest req) {
        InventoryItem item = findItemById(req.getItemId());
        StockBatch batch = new StockBatch();
        batch.setItem(item);
        batch.setBatchNumber(req.getBatchNumber());
        batch.setQuantityReceived(req.getQuantity());
        batch.setQuantityRemaining(req.getQuantity());
        batch.setUnitCost(req.getUnitCost());
        batch.setSupplier(req.getSupplier());
        batch.setExpiryDate(req.getExpiryDate());
        batch.setDateReceived(req.getDateReceived() != null ? req.getDateReceived() : LocalDate.now());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(batch::setReceivedBy);
        batchRepository.save(batch);

        recordMovement(item, MovementType.STOCK_IN, req.getQuantity(), "Stock In", null, null, null, null, null);
        checkExpiryAlert(batch, item.getItemName());
    }

    @Transactional
    public void stockOut(StockOutRequest req) {
        InventoryItem item = findItemById(req.getItemId());
        double totalAvailable = batchRepository.getTotalStock(item.getId());
        if (totalAvailable < req.getQuantity())
            throw new BusinessException("Insufficient stock. Available: " + totalAvailable);

        List<StockBatch> batches = batchRepository.findAvailableBatchesFEFO(item.getId(), LocalDate.now());
        double remaining = req.getQuantity();
        for (StockBatch batch : batches) {
            if (remaining <= 0) break;
            double deduct = Math.min(batch.getQuantityRemaining(), remaining);
            batch.setQuantityRemaining(batch.getQuantityRemaining() - deduct);
            batchRepository.save(batch);
            remaining -= deduct;
        }

        recordMovement(item, MovementType.STOCK_OUT, req.getQuantity(), req.getReason(),
                req.getIssuedToType(), req.getFarmId(), req.getDepartment(), req.getReferenceType(), req.getReferenceId());

        checkLowStockAlert(item);
    }

    public List<InventoryItemResponse> getLowStockItems() {
        return itemRepository.findAll().stream()
                .filter(item -> item.getMinimumStockLevel() != null &&
                        batchRepository.getTotalStock(item.getId()) < item.getMinimumStockLevel())
                .map(this::toItemResponse)
                .collect(Collectors.toList());
    }

    public List<StockBatch> getExpiringItems() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(expiryWarningDays);
        return batchRepository.findExpiringBatches(today, warningDate);
    }

    private void checkLowStockAlert(InventoryItem item) {
        if (item.getMinimumStockLevel() != null) {
            double current = batchRepository.getTotalStock(item.getId());
            if (current < item.getMinimumStockLevel())
                notificationService.createLowStockAlert(item.getItemName(), current, item.getUnit().name());
        }
    }

    private void checkExpiryAlert(StockBatch batch, String itemName) {
        if (batch.getExpiryDate() != null &&
                batch.getExpiryDate().isBefore(LocalDate.now().plusDays(expiryWarningDays)))
            notificationService.createExpiryAlert(itemName, batch.getExpiryDate().toString());
    }

    private void recordMovement(InventoryItem item, MovementType type, Double qty, String reason,
                                 IssuedToType issuedToType, Long farmId, String dept, String refType, Long refId) {
        StockMovement m = new StockMovement();
        m.setItem(item);
        m.setMovementType(type);
        m.setQuantity(qty);
        m.setReason(reason);
        m.setIssuedToType(issuedToType);
        m.setFarmId(farmId);
        m.setDepartment(dept);
        m.setReferenceType(refType);
        m.setReferenceId(refId);
        m.setMovementDate(LocalDate.now());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email).ifPresent(m::setPerformedBy);
        movementRepository.save(m);
    }

    private InventoryItem findItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + id));
    }

    public InventoryItemResponse toItemResponse(InventoryItem item) {
        InventoryItemResponse r = new InventoryItemResponse();
        r.setId(item.getId());
        r.setItemName(item.getItemName());
        r.setCategory(item.getCategory());
        r.setUnit(item.getUnit());
        r.setMinimumStockLevel(item.getMinimumStockLevel());
        r.setExpiryRequired(item.isExpiryRequired());
        r.setStatus(item.getStatus());
        r.setCurrentStock(batchRepository.getTotalStock(item.getId()));
        r.setCreatedAt(item.getCreatedAt());
        r.setUpdatedAt(item.getUpdatedAt());
        return r;
    }
}
