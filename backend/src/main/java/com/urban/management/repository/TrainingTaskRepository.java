package com.urban.management.repository;

import com.urban.management.entity.TrainingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingTaskRepository extends JpaRepository<TrainingTask, Long> {
    
    List<TrainingTask> findByTrainedBy(Long trainedBy);
    
    List<TrainingTask> findByStatus(String status);
    
    List<TrainingTask> findByModelType(String modelType);
}
