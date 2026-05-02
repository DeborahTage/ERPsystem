package com.trustagro.config;

import com.trustagro.common.response.ApiResponse;
import com.trustagro.farm.repository.DailyFarmRecordRepository;
import com.trustagro.farm.repository.FarmRepository;
import com.trustagro.farm.repository.FlockRepository;
import com.trustagro.farm.entity.FarmStatus;
import com.trustagro.farm.entity.FlockStatus;
import com.trustagro.finance.service.FinanceService;
import com.trustagro.inventory.repository.StockBatchRepository;
import com.trustagro.inventory.repository.InventoryItemRepository;
import com.trustagro.notification.repository.NotificationRepository;
import com.trustagro.pharmacy.repository.PharmacySaleRepository;
import com.trustagro.veterinary.entity.VaccinationStatus;
import com.trustagro.veterinary.repository.VaccinationScheduleRepository;
import com.trustagro.veterinary.repository.DiseaseCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final FarmRepository farmRepository;
    private final FlockRepository flockRepository;
    private final DailyFarmRecordRepository dailyRecordRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final StockBatchRepository stockBatchRepository;
    private final PharmacySaleRepository saleRepository;
    private final FinanceService financeService;
    private final NotificationRepository notificationRepository;
    private final VaccinationScheduleRepository vaccinationRepository;
    private final DiseaseCaseRepository diseaseCaseRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN','GENERAL_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalFarms", farmRepository.countByStatus(FarmStatus.ACTIVE));
        data.put("totalActiveFlocks", flockRepository.countByStatus(FlockStatus.ACTIVE));
        data.put("todayMortality", dailyRecordRepository.sumMortalityByDate(LocalDate.now()));
        data.put("todayPharmacySales", saleRepository.sumTotalByDate(LocalDate.now()));
        var pl = financeService.getProfitLoss(null, null);
        data.put("totalRevenue", pl.getTotalIncome());
        data.put("totalExpenses", pl.getTotalExpenses());
        data.put("netProfitLoss", pl.getNetProfitLoss());
        data.put("pendingAlerts", notificationRepository.count());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/farm-manager")
    @PreAuthorize("hasAnyRole('ADMIN','FARM_MANAGER','OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> farmManagerDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalFarms", farmRepository.countByStatus(FarmStatus.ACTIVE));
        data.put("activeFlocks", flockRepository.countByStatus(FlockStatus.ACTIVE));
        data.put("todayMortality", dailyRecordRepository.sumMortalityByDate(LocalDate.now()));
        data.put("upcomingVaccinations", vaccinationRepository
                .findByScheduledDateAfterAndStatus(LocalDate.now(), VaccinationStatus.SCHEDULED).size());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/store")
    @PreAuthorize("hasAnyRole('ADMIN','STORE_KEEPER','OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> storeDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalItems", inventoryItemRepository.count());
        data.put("expiringItems", stockBatchRepository
                .findExpiringBatches(LocalDate.now(), LocalDate.now().plusDays(30)).size());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/vet")
    @PreAuthorize("hasAnyRole('ADMIN','VETERINARY_OFFICER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> vetDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("upcomingVaccinations", vaccinationRepository
                .findByScheduledDateAfterAndStatus(LocalDate.now(), VaccinationStatus.SCHEDULED).size());
        data.put("missedVaccinations", vaccinationRepository
                .findByScheduledDateBeforeAndStatus(LocalDate.now(), VaccinationStatus.SCHEDULED).size());
        data.put("activeDiseaseCases", diseaseCaseRepository.count());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/pharmacy")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_SALES')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> pharmacyDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("todaySales", saleRepository.sumTotalByDate(LocalDate.now()));
        data.put("totalSalesCount", saleRepository.count());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/finance")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE_OFFICER','GENERAL_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> financeDashboard() {
        var pl = financeService.getProfitLoss(null, null);
        Map<String, Object> data = new HashMap<>();
        data.put("totalIncome", pl.getTotalIncome());
        data.put("totalExpenses", pl.getTotalExpenses());
        data.put("netProfitLoss", pl.getNetProfitLoss());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
