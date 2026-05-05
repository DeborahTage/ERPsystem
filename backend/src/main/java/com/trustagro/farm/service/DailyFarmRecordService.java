package com.trustagro.farm.service;

import com.trustagro.common.exception.BusinessException;
import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.farm.dto.DailyFarmRecordRequest;
import com.trustagro.farm.dto.DailyFarmRecordResponse;
import com.trustagro.farm.dto.FarmKpiResponse;
import com.trustagro.farm.entity.DailyFarmRecord;
import com.trustagro.farm.entity.Farm;
import com.trustagro.farm.entity.Flock;
import com.trustagro.farm.repository.DailyFarmRecordRepository;
import com.trustagro.farm.repository.FarmRepository;
import com.trustagro.farm.repository.FlockRepository;
import com.trustagro.notification.service.NotificationService;
import com.trustagro.user.entity.User;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyFarmRecordService {

    private final DailyFarmRecordRepository recordRepository;
    private final FarmRepository farmRepository;
    private final FlockRepository flockRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.alerts.mortality-threshold}")
    private double mortalityThreshold;

    @Transactional(readOnly = true)
    public List<DailyFarmRecordResponse> getAll() {
        return recordRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DailyFarmRecordResponse> getByFarm(Long farmId) {
        ensureFarmExists(farmId);
        return recordRepository.findByFarmIdOrderByDateDesc(farmId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DailyFarmRecordResponse> getByFlock(Long flockId) {
        return recordRepository.findByFlockId(flockId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DailyFarmRecordResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public DailyFarmRecordResponse create(DailyFarmRecordRequest req) {
        if (recordRepository.existsByFarmIdAndFlockIdAndDate(req.getFarmId(), req.getFlockId(), req.getDate()))
            throw new BusinessException("Daily record already exists for this farm, flock, and date");

        Farm farm = farmRepository.findById(req.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));
        Flock flock = flockRepository.findById(req.getFlockId())
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found"));
        validateFarmFlock(farm, flock);
        validateCounts(req);

        DailyFarmRecord record = new DailyFarmRecord();
        mapRequest(req, record, farm, flock);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            userRepository.findByEmail(authentication.getName()).ifPresent(record::setRecordedBy);
        }

        DailyFarmRecord saved = recordRepository.save(record);

        int newCount = (flock.getCurrentBirdCount() != null ? flock.getCurrentBirdCount() : flock.getInitialBirdCount())
                - (req.getMortality() != null ? req.getMortality() : 0)
                - (req.getCulledBirds() != null ? req.getCulledBirds() : 0);
        flock.setCurrentBirdCount(Math.max(0, newCount));
        flockRepository.save(flock);

        if (req.getMortality() != null && req.getOpeningBirdCount() != null && req.getOpeningBirdCount() > 0) {
            double rate = (double) req.getMortality() / req.getOpeningBirdCount() * 100;
            if (rate > mortalityThreshold) {
                notificationService.createMortalityAlert(farm.getFarmName(), flock.getBatchCode(), rate);
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public DailyFarmRecordResponse update(Long id, DailyFarmRecordRequest req) {
        DailyFarmRecord record = findById(id);
        if (recordRepository.existsByFarmIdAndFlockIdAndDateAndIdNot(req.getFarmId(), req.getFlockId(), req.getDate(), id)) {
            throw new BusinessException("Daily record already exists for this farm, flock, and date");
        }
        Farm farm = farmRepository.findById(req.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));
        Flock flock = flockRepository.findById(req.getFlockId())
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found"));
        validateFarmFlock(farm, flock);
        validateCounts(req);
        mapRequest(req, record, farm, flock);
        return toResponse(recordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public FarmKpiResponse getFarmKpis(Long farmId) {
        Farm farm = ensureFarmExists(farmId);
        List<Flock> flocks = flockRepository.findByFarmId(farmId);
        List<DailyFarmRecord> records = recordRepository.findByFarmId(farmId);

        int totalInitialBirds = flocks.stream()
                .map(Flock::getInitialBirdCount)
                .mapToInt(value -> value == null ? 0 : value)
                .sum();
        int currentBirdCount = flocks.stream()
                .map(Flock::getCurrentBirdCount)
                .mapToInt(value -> value == null ? 0 : value)
                .sum();
        int totalMortality = records.stream()
                .map(DailyFarmRecord::getMortality)
                .mapToInt(value -> value == null ? 0 : value)
                .sum();
        BigDecimal totalFeed = records.stream()
                .map(DailyFarmRecord::getFeedConsumed)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalWater = records.stream()
                .map(DailyFarmRecord::getWaterConsumed)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalEggProduction = records.stream()
                .map(DailyFarmRecord::getEggProduction)
                .mapToInt(value -> value == null ? 0 : value)
                .sum();

        FarmKpiResponse response = new FarmKpiResponse();
        response.setFarmId(farm.getId());
        response.setFarmName(farm.getFarmName());
        response.setTotalInitialBirds(totalInitialBirds);
        response.setCurrentBirdCount(currentBirdCount);
        response.setTotalMortality(totalMortality);
        response.setMortalityRate(totalInitialBirds == 0 ? 0 : (double) totalMortality / totalInitialBirds * 100);
        response.setTotalFeedUsed(totalFeed);
        response.setTotalWaterUsed(totalWater);
        response.setTotalEggProduction(totalEggProduction);
        response.setAverageEggProductionPerRecord(records.isEmpty() ? 0 : (double) totalEggProduction / records.size());
        response.setFeedUsedPerCurrentBird(currentBirdCount == 0
                ? BigDecimal.ZERO
                : totalFeed.divide(BigDecimal.valueOf(currentBirdCount), 2, RoundingMode.HALF_UP));
        return response;
    }

    private void mapRequest(DailyFarmRecordRequest req, DailyFarmRecord record, Farm farm, Flock flock) {
        record.setDate(req.getDate());
        record.setFarm(farm);
        record.setFlock(flock);
        record.setOpeningBirdCount(req.getOpeningBirdCount());
        record.setMortality(req.getMortality());
        record.setCulledBirds(req.getCulledBirds());
        record.setFeedConsumed(req.getFeedIntake());
        record.setWaterConsumed(req.getWaterIntake());
        record.setAverageWeight(req.getAverageWeight());
        record.setEggProduction(req.getEggProduction());
        record.setDamagedEggs(req.getDamagedEggs());
        record.setSymptomsOrRemarks(req.getRemarks());
    }

    private void validateFarmFlock(Farm farm, Flock flock) {
        if (!flock.getFarm().getId().equals(farm.getId())) {
            throw new BusinessException("Flock does not belong to the selected farm");
        }
    }

    private void validateCounts(DailyFarmRecordRequest req) {
        int openingCount = req.getOpeningBirdCount() == null ? 0 : req.getOpeningBirdCount();
        int mortality = req.getMortality() == null ? 0 : req.getMortality();
        int culledBirds = req.getCulledBirds() == null ? 0 : req.getCulledBirds();
        if (req.getOpeningBirdCount() != null && mortality + culledBirds > openingCount) {
            throw new BusinessException("Mortality and culled birds cannot exceed opening bird count");
        }
    }

    private Farm ensureFarmExists(Long farmId) {
        return farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + farmId));
    }

    private DailyFarmRecord findById(Long id) {
        return recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Daily record not found: " + id));
    }

    public DailyFarmRecordResponse toResponse(DailyFarmRecord r) {
        DailyFarmRecordResponse res = new DailyFarmRecordResponse();
        res.setId(r.getId());
        res.setDate(r.getDate());
        res.setFarmId(r.getFarm().getId());
        res.setFarmName(r.getFarm().getFarmName());
        res.setFlockId(r.getFlock().getId());
        res.setBatchCode(r.getFlock().getBatchCode());
        res.setOpeningBirdCount(r.getOpeningBirdCount());
        res.setMortality(r.getMortality());
        res.setCulledBirds(r.getCulledBirds());
        res.setFeedIntake(r.getFeedConsumed());
        res.setWaterIntake(r.getWaterConsumed());
        res.setAverageWeight(r.getAverageWeight());
        res.setEggProduction(r.getEggProduction());
        res.setDamagedEggs(r.getDamagedEggs());
        res.setRemarks(r.getSymptomsOrRemarks());
        if (r.getRecordedBy() != null) res.setRecordedBy(r.getRecordedBy().getFullName());
        if (r.getMortality() != null && r.getOpeningBirdCount() != null && r.getOpeningBirdCount() > 0)
            res.setMortalityRate((double) r.getMortality() / r.getOpeningBirdCount() * 100);
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());
        return res;
    }
}
