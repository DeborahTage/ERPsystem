package com.trustagro.farm.repository;

import com.trustagro.farm.entity.Flock;
import com.trustagro.farm.entity.FlockStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlockRepository extends JpaRepository<Flock, Long> {
    List<Flock> findByFarmId(Long farmId);
    List<Flock> findByStatus(FlockStatus status);
    long countByStatus(FlockStatus status);
    boolean existsByBatchCode(String batchCode);
    boolean existsByBatchCodeAndIdNot(String batchCode, Long id);
}
