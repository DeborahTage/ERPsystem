package com.trustagro.farm.service;

import com.trustagro.common.exception.BusinessException;
import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.farm.dto.FarmRequest;
import com.trustagro.farm.dto.FarmResponse;
import com.trustagro.farm.entity.Farm;
import com.trustagro.farm.entity.FarmStatus;
import com.trustagro.farm.repository.FarmRepository;
import com.trustagro.user.entity.User;
import com.trustagro.user.entity.RoleName;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FarmResponse> getAll() {
        return farmRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FarmResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public FarmResponse create(FarmRequest req) {
        Farm farm = new Farm();
        mapRequest(req, farm);
        return toResponse(farmRepository.save(farm));
    }

    @Transactional
    public FarmResponse update(Long id, FarmRequest req) {
        Farm farm = findById(id);
        mapRequest(req, farm);
        return toResponse(farmRepository.save(farm));
    }

    @Transactional
    public FarmResponse updateStatus(Long id, FarmStatus status) {
        Farm farm = findById(id);
        farm.setStatus(status);
        return toResponse(farmRepository.save(farm));
    }

    private void mapRequest(FarmRequest req, Farm farm) {
        farm.setFarmName(req.getName());
        farm.setLocation(req.getLocation());
        farm.setFarmType(req.getFarmType());
        farm.setCapacity(req.getCapacity());
        if (req.getManagerId() != null) {
            User manager = userRepository.findById(req.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (manager.getRole() != RoleName.FARM_MANAGER && !manager.hasRole(RoleName.FARM_MANAGER)) {
                throw new BusinessException("Assigned manager must have FARM_MANAGER role");
            }
            farm.setAssignedFarmManager(manager);
        } else {
            farm.setAssignedFarmManager(null);
        }
    }

    public Farm findById(Long id) {
        return farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + id));
    }

    public FarmResponse toResponse(Farm farm) {
        FarmResponse r = new FarmResponse();
        r.setId(farm.getId());
        r.setName(farm.getFarmName());
        r.setLocation(farm.getLocation());
        r.setFarmType(farm.getFarmType());
        r.setCapacity(farm.getCapacity());
        r.setStatus(farm.getStatus());
        r.setCreatedAt(farm.getCreatedAt());
        r.setUpdatedAt(farm.getUpdatedAt());
        if (farm.getAssignedFarmManager() != null) {
            r.setManagerId(farm.getAssignedFarmManager().getId());
            r.setManagerName(farm.getAssignedFarmManager().getFullName());
        }
        return r;
    }
}
