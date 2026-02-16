package com.urban.management.scheduler;

import com.urban.management.entity.AIModel;
import com.urban.management.entity.TrainingTask;
import com.urban.management.repository.AIModelRepository;
import com.urban.management.repository.TrainingTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class TrainingTaskScheduler {

    @Autowired
    private TrainingTaskRepository trainingTaskRepository;

    @Autowired
    private AIModelRepository aiModelRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_TRAINING_SERVICE_URL = "http://localhost:8001";

    @Scheduled(fixedRate = 5000)
    public void updateTrainingProgress() {
        List<TrainingTask> trainingTasks = trainingTaskRepository.findByStatus("training");
        
        for (TrainingTask task : trainingTasks) {
            try {
                String url = PYTHON_TRAINING_SERVICE_URL + "/progress/" + task.getId();
                Map<String, Object> progressResponse = restTemplate.getForObject(url, Map.class);
                
                if (progressResponse != null) {
                    int progressValue = 0;
                    double accuracyValue = 0.0;
                    String status = (String) progressResponse.get("status");
                    
                    if (progressResponse.get("progress") != null) {
                        progressValue = ((Number) progressResponse.get("progress")).intValue();
                    }
                    
                    if (progressResponse.get("accuracy") != null) {
                        accuracyValue = ((Number) progressResponse.get("accuracy")).doubleValue();
                    }
                    
                    task.setProgress(progressValue);
                    task.setAccuracy(accuracyValue);
                    
                    if ("completed".equals(status) && progressValue >= 100) {
                        url = PYTHON_TRAINING_SERVICE_URL + "/result/" + task.getId();
                        Map<String, Object> resultResponse = restTemplate.getForObject(url, Map.class);
                        
                        if (resultResponse != null && resultResponse.containsKey("model_path")) {
                            task.setStatus("completed");
                            task.setModelPath((String) resultResponse.get("model_path"));
                            task.setCompletedAt(java.time.LocalDateTime.now());
                            
                            if (resultResponse.get("accuracy") != null) {
                                task.setAccuracy(((Number) resultResponse.get("accuracy")).doubleValue());
                            }
                            
                            trainingTaskRepository.save(task);
                            createAIModelFromTask(task);
                        }
                    } else if ("failed".equals(status)) {
                        task.setStatus("failed");
                        String error = (String) progressResponse.get("error");
                        if (error != null) {
                            System.err.println("训练任务 " + task.getId() + " 失败: " + error);
                        }
                        trainingTaskRepository.save(task);
                    } else {
                        trainingTaskRepository.save(task);
                    }
                }
            } catch (Exception e) {
                System.err.println("检查训练任务 " + task.getId() + " 进度失败: " + e.getMessage());
                // 如果是404错误，说明任务在Python服务中不存在，将任务标记为失败
                if (e.getMessage().contains("404") || e.getMessage().contains("Not Found")) {
                    task.setStatus("failed");
                    task.setProgress(0);
                    trainingTaskRepository.save(task);
                    System.err.println("训练任务 " + task.getId() + " 在Python服务中不存在，标记为失败状态");
                }
            }
        }
    }

    private void createAIModelFromTask(TrainingTask task) {
        AIModel model = new AIModel();
        model.setName(task.getName());
        model.setType(task.getModelType());
        model.setDescription(task.getDescription());
        model.setVersion("1.0.0");
        model.setStatus("active");
        model.setAccuracy(task.getAccuracy());
        model.setCreatedBy(task.getTrainedBy());
        model.setTrainingDataSize(task.getPhotoCount() + " 张图片");
        model.setIsProduction(false);
        model.setModelPath(task.getModelPath());
        model.setTrainingTask(task);
        
        aiModelRepository.save(model);
    }
}