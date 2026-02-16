package com.urban.management.repository;

import com.urban.management.entity.RatingResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingResultRepository extends JpaRepository<RatingResult, Long> {
    
    List<RatingResult> findByModelId(Long modelId);
    
    List<RatingResult> findByModelIdOrderByAnalyzedAtDesc(Long modelId);
}
