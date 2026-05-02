package com.trustagro.notification.service;

import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.notification.dto.NotificationResponse;
import com.trustagro.notification.entity.Notification;
import com.trustagro.notification.entity.NotificationType;
import com.trustagro.notification.repository.NotificationRepository;
import com.trustagro.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createMortalityAlert(String farmName, String batchCode, double rate) {
        create("High Mortality Alert",
                String.format("Farm: %s, Batch: %s - Mortality rate %.1f%% exceeds threshold", farmName, batchCode, rate),
                NotificationType.URGENT, Role.VETERINARY_OFFICER, "FARM", null);
        create("High Mortality Alert",
                String.format("Farm: %s, Batch: %s - Mortality rate %.1f%% exceeds threshold", farmName, batchCode, rate),
                NotificationType.URGENT, Role.OPERATIONS_MANAGER, "FARM", null);
    }

    public void createLowStockAlert(String itemName, double currentStock, String unit) {
        create("Low Stock Alert",
                String.format("Item: %s - Current stock %.1f %s is below minimum level", itemName, currentStock, unit),
                NotificationType.WARNING, Role.STORE_KEEPER, "INVENTORY", null);
    }

    public void createExpiryAlert(String itemName, String expiryDate) {
        create("Expiry Alert",
                String.format("Item: %s expires on %s (within 30 days)", itemName, expiryDate),
                NotificationType.WARNING, Role.STORE_KEEPER, "INVENTORY", null);
    }

    public void createMissedVaccinationAlert(String farmName, String vaccineName) {
        create("Missed Vaccination",
                String.format("Farm: %s - Vaccination '%s' was missed", farmName, vaccineName),
                NotificationType.WARNING, Role.VETERINARY_OFFICER, "VETERINARY", null);
    }

    public void createFollowUpAlert(String clientName, Long clientId) {
        create("CRM Follow-up Due",
                String.format("Follow-up due for client: %s", clientName),
                NotificationType.INFO, Role.EXTENSION_WORKER, "CRM", clientId);
    }

    private void create(String title, String message, NotificationType type, Role role, String module, Long relatedId) {
        Notification n = new Notification();
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setTargetRole(role);
        n.setRelatedModule(module);
        n.setRelatedId(relatedId);
        notificationRepository.save(n);
    }

    public List<NotificationResponse> getAll() {
        return notificationRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public NotificationResponse markRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setRead(true);
        return toResponse(notificationRepository.save(n));
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setType(n.getType());
        r.setTargetRole(n.getTargetRole());
        r.setRelatedModule(n.getRelatedModule());
        r.setRead(n.isRead());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}
