package com.urban.management.service;

import com.urban.management.entity.TrainingTask;

import java.util.List;

public interface TrainingTaskService {
    
    List<TrainingTask> getAllTasks();
    
    TrainingTask getTaskById(Long id);
    
    TrainingTask createTask(String name, String description, String modelType, Long trainedBy, Long datasetId, String regressionHead);
    
    TrainingTask updateTask(Long id, String name, String description);
    
    void deleteTask(Long id);
    
    List<TrainingTask> getTasksByTrainedBy(Long trainedBy);
    
    List<TrainingTask> getTasksByStatus(String status);
    
    List<TrainingTask> getTasksByModelType(String modelType);
    
    TrainingTask startTraining(Long taskId);
    
    TrainingTask updateTaskProgress(Long taskId, Integer progress);
    
    TrainingTask completeTask(Long taskId, Double accuracy, String modelPath);
    
    TrainingTask failTask(Long taskId, String errorMessage);
}
