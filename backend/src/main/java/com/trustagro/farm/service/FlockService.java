package com.trustagro.farm.service;

import com.trustagro.common.exception.BusinessException;
import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.farm.dto.FlockRequest;
import com.trustagro.farm.dto.FlockResponse;
import com.trustagro.farm.entity.Farm;
import com.trustagro.farm.entity.Flock;
import com.trustagro.farm.entity.FlockStatus;
import com.trustagro.farm.repository.FarmRepository;
import com.trustagro.farm.repository.FlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlockService {

    private final FlockRepository flockRepository;
    private final FarmRepository farmRepository;

    @Transactional(readOnly = true)
    public List<FlockResponse> getAll() {
        return flockRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FlockResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public FlockResponse create(FlockRequest req) {
        if (flockRepository.existsByBatchCode(req.getBatchCode())) {
            throw new BusinessException("Batch code already exists");
        }
        Farm farm = farmRepository.findById(req.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));
        Flock flock = new Flock();
        flock.setBatchCode(req.getBatchCode());
        flock.setFarm(farm);
        flock.setBirdType(req.getType());
        flock.setInitialBirdCount(req.getInitialCount());
        flock.setCurrentBirdCount(req.getInitialCount());
        flock.setStartDate(req.getStartDate());
        flock.setExpectedEndDate(req.getExpectedEndDate());
        return toResponse(flockRepository.save(flock));
    }

    @Transactional
    public FlockResponse update(Long id, FlockRequest req) {
        Flock flock = findById(id);
        if (!flock.getBatchCode().equals(req.getBatchCode())
                && flockRepository.existsByBatchCodeAndIdNot(req.getBatchCode(), id)) {
            throw new BusinessException("Batch code already exists");
        }
        Farm farm = farmRepository.findById(req.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));
        flock.setBatchCode(req.getBatchCode());
        flock.setFarm(farm);
        flock.setBirdType(req.getType());
        flock.setInitialBirdCount(req.getInitialCount());
        if (flock.getCurrentBirdCount() == null || flock.getCurrentBirdCount() > req.getInitialCount()) {
            flock.setCurrentBirdCount(req.getInitialCount());
        }
        flock.setStartDate(req.getStartDate());
        flock.setExpectedEndDate(req.getExpectedEndDate());
        return toResponse(flockRepository.save(flock));
    }

    @Transactional
    public FlockResponse close(Long id) {
        Flock flock = findById(id);
        flock.setStatus(FlockStatus.CLOSED);
        return toResponse(flockRepository.save(flock));
    }

    private Flock findById(Long id) {
        return flockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flock not found: " + id));
    }

    public FlockResponse toResponse(Flock flock) {
        FlockResponse r = new FlockResponse();
        r.setId(flock.getId());
        r.setBatchCode(flock.getBatchCode());
        r.setFarmId(flock.getFarm().getId());
        r.setFarmName(flock.getFarm().getFarmName());
        r.setType(flock.getBirdType());
        r.setInitialCount(flock.getInitialBirdCount());
        r.setCurrentCount(flock.getCurrentBirdCount());
        r.setStartDate(flock.getStartDate());
        r.setExpectedEndDate(flock.getExpectedEndDate());
        r.setStatus(flock.getStatus());
        r.setCreatedAt(flock.getCreatedAt());
        r.setUpdatedAt(flock.getUpdatedAt());
        return r;
    }
}
