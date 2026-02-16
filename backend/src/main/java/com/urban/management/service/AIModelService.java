package com.urban.management.service;

import com.urban.management.entity.AIModel;

import java.util.List;

public interface AIModelService {
    
    List<AIModel> getAllModels();
    
    AIModel getModelById(Long id);
    
    AIModel createModel(String name, String type, String description, String version, Long createdBy, Long trainingTaskId, String modelPath, String trainingDataSize, Double accuracy);
    
    AIModel updateModel(Long id, String name, String description, String status);
    
    void deleteModel(Long id);
    
    List<AIModel> getModelsByCreatedBy(Long createdBy);
    
    List<AIModel> getModelsByStatus(String status);
    
    List<AIModel> getModelsByType(String type);
    
    List<AIModel> getProductionModels();
    
    AIModel setProductionModel(Long id);
    
    AIModel deactivateModel(Long id);
}
