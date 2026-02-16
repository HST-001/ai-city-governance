package com.urban.management.repository;

import com.urban.management.entity.AIModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIModelRepository extends JpaRepository<AIModel, Long> {
    
    List<AIModel> findByCreatedBy(Long createdBy);
    
    List<AIModel> findByStatus(String status);
    
    List<AIModel> findByType(String type);
    
    List<AIModel> findByIsProduction(Boolean isProduction);
}
