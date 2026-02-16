package com.urban.management.repository;

import com.urban.management.entity.TrainingDataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingDatasetRepository extends JpaRepository<TrainingDataset, Long> {
    
    List<TrainingDataset> findByUploadedBy(Long uploadedBy);
    
    List<TrainingDataset> findByStatus(String status);
    
    List<TrainingDataset> findByUploadedByAndStatus(Long uploadedBy, String status);
}
