package com.urban.management.service.impl;

import com.urban.management.entity.AIModel;
import com.urban.management.entity.TrainingTask;
import com.urban.management.repository.AIModelRepository;
import com.urban.management.repository.TrainingTaskRepository;
import com.urban.management.service.AIModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIModelServiceImpl implements AIModelService {

    @Autowired
    private AIModelRepository aiModelRepository;

    @Autowired
    private TrainingTaskRepository trainingTaskRepository;

    @Override
    public List<AIModel> getAllModels() {
        return aiModelRepository.findAll();
    }

    @Override
    public AIModel getModelById(Long id) {
        return aiModelRepository.findById(id).orElse(null);
    }

    @Override
    public AIModel createModel(String name, String type, String description, String version, Long createdBy, Long trainingTaskId, String modelPath, String trainingDataSize, Double accuracy) {
        AIModel model = new AIModel();
        model.setName(name);
        model.setType(type);
        model.setDescription(description);
        model.setVersion(version);
        model.setCreatedBy(createdBy);
        model.setModelPath(modelPath);
        model.setTrainingDataSize(trainingDataSize);
        model.setAccuracy(accuracy != null ? accuracy : 0.0);
        model.setStatus("inactive");
        model.setIsProduction(false);

        if (trainingTaskId != null) {
            TrainingTask task = trainingTaskRepository.findById(trainingTaskId).orElse(null);
            model.setTrainingTask(task);
            if (task != null && "completed".equals(task.getStatus())) {
                model.setAccuracy(task.getAccuracy());
            }
        }

        return aiModelRepository.save(model);
    }

    @Override
    public AIModel updateModel(Long id, String name, String description, String status) {
        AIModel model = aiModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("模型不存在: " + id));

        if (name != null && !name.isEmpty()) {
            model.setName(name);
        }
        if (description != null) {
            model.setDescription(description);
        }
        if (status != null && !status.isEmpty()) {
            model.setStatus(status);
        }

        return aiModelRepository.save(model);
    }

    @Override
    public void deleteModel(Long id) {
        aiModelRepository.deleteById(id);
    }

    @Override
    public List<AIModel> getModelsByCreatedBy(Long createdBy) {
        return aiModelRepository.findByCreatedBy(createdBy);
    }

    @Override
    public List<AIModel> getModelsByStatus(String status) {
        return aiModelRepository.findByStatus(status);
    }

    @Override
    public List<AIModel> getModelsByType(String type) {
        return aiModelRepository.findByType(type);
    }

    @Override
    public List<AIModel> getProductionModels() {
        return aiModelRepository.findByIsProduction(true);
    }

    @Override
    public AIModel setProductionModel(Long id) {
        AIModel model = aiModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("模型不存在: " + id));

        List<AIModel> productionModels = getProductionModels();
        for (AIModel productionModel : productionModels) {
            productionModel.setIsProduction(false);
            aiModelRepository.save(productionModel);
        }

        model.setIsProduction(true);
        model.setStatus("active");
        return aiModelRepository.save(model);
    }

    @Override
    public AIModel deactivateModel(Long id) {
        AIModel model = aiModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("模型不存在: " + id));

        model.setStatus("inactive");
        model.setIsProduction(false);
        return aiModelRepository.save(model);
    }
}
