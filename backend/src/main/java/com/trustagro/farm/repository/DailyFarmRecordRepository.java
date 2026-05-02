package com.trustagro.farm.repository;

import com.trustagro.farm.entity.DailyFarmRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyFarmRecordRepository extends JpaRepository<DailyFarmRecord, Long> {
    List<DailyFarmRecord> findByFarmId(Long farmId);
    List<DailyFarmRecord> findByFlockId(Long flockId);
    boolean existsByFarmIdAndFlockIdAndDate(Long farmId, Long flockId, LocalDate date);
    Optional<DailyFarmRecord> findTopByFlockIdOrderByDateDesc(Long flockId);

    @Query("SELECT COALESCE(SUM(d.mortality), 0) FROM DailyFarmRecord d WHERE d.date = :date")
    Integer sumMortalityByDate(@Param("date") LocalDate date);
}
