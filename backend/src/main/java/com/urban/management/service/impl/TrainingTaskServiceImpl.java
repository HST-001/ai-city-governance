package com.urban.management.service.impl;

import com.urban.management.entity.TrainingDataset;
import com.urban.management.entity.TrainingTask;
import com.urban.management.repository.TrainingDatasetRepository;
import com.urban.management.repository.TrainingTaskRepository;
import com.urban.management.service.TrainingTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TrainingTaskServiceImpl implements TrainingTaskService {

    @Autowired
    private TrainingTaskRepository trainingTaskRepository;

    @Autowired
    private TrainingDatasetRepository trainingDatasetRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_TRAINING_SERVICE_URL = "http://localhost:8001";

    @Override
    public List<TrainingTask> getAllTasks() {
        return trainingTaskRepository.findAll();
    }

    @Override
    public TrainingTask getTaskById(Long id) {
        return trainingTaskRepository.findById(id).orElse(null);
    }

    @Override
    public TrainingTask createTask(String name, String description, String modelType, Long trainedBy, Long datasetId, String regressionHead) {
        System.out.println("===== 创建训练任务 =====");
        System.out.println("任务名称: " + name);
        System.out.println("模型类型: " + modelType);
        System.out.println("回归头: " + regressionHead);
        System.out.println("数据集ID: " + datasetId);
        
        TrainingTask task = new TrainingTask();
        task.setName(name);
        task.setDescription(description);
        task.setModelType(modelType);
        task.setRegressionHead(regressionHead != null ? regressionHead : "none");
        task.setTrainedBy(trainedBy);
        task.setStatus("pending");
        task.setProgress(0);
        task.setAccuracy(0.0);
        task.setPhotoCount(0);

        if (datasetId != null) {
            TrainingDataset dataset = trainingDatasetRepository.findById(datasetId).orElse(null);
            if (dataset != null) {
                // 只设置datasetId和photoCount，不设置dataset对象以避免JPA关联冲突
                task.setDatasetId(datasetId);
                task.setPhotoCount(dataset.getFileCount());
                System.out.println("数据集文件数量: " + dataset.getFileCount());
            } else {
                System.err.println("错误: 数据集不存在，ID: " + datasetId);
                throw new RuntimeException("数据集不存在，ID: " + datasetId);
            }
        }

        TrainingTask savedTask = trainingTaskRepository.save(task);
        System.out.println("任务已保存，ID: " + savedTask.getId() + ", 数据集ID: " + savedTask.getDatasetId());
        
        return savedTask;
    }

    @Override
    public TrainingTask updateTask(Long id, String name, String description) {
        TrainingTask task = trainingTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("训练任务不存在: " + id));

        if (name != null && !name.isEmpty()) {
            task.setName(name);
        }
        if (description != null) {
            task.setDescription(description);
        }

        return trainingTaskRepository.save(task);
    }

    @Override
    public void deleteTask(Long id) {
        trainingTaskRepository.deleteById(id);
    }

    @Override
    public List<TrainingTask> getTasksByTrainedBy(Long trainedBy) {
        return trainingTaskRepository.findByTrainedBy(trainedBy);
    }

    @Override
    public List<TrainingTask> getTasksByStatus(String status) {
        return trainingTaskRepository.findByStatus(status);
    }

    @Override
    public List<TrainingTask> getTasksByModelType(String modelType) {
        return trainingTaskRepository.findByModelType(modelType);
    }

    @Override
    public TrainingTask startTraining(Long taskId) {
        System.out.println("\n\n===== 开始训练任务 =====");
        System.out.println("任务ID: " + taskId);
        
        TrainingTask task = trainingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("训练任务不存在: " + taskId));

        System.out.println("当前任务状态: " + task.getStatus());
        System.out.println("任务中的datasetId: " + task.getDatasetId());
        System.out.println("任务中的数据集对象: " + task.getDataset());
        
        if (!"pending".equals(task.getStatus())) {
            throw new RuntimeException("任务状态不允许开始训练: " + task.getStatus());
        }

        // 先获取数据集路径，再修改任务状态
        String datasetPath = null;
        if (task.getDatasetId() != null) {
            System.out.println("通过datasetId获取数据集: " + task.getDatasetId());
            TrainingDataset dataset = trainingDatasetRepository.findById(task.getDatasetId()).orElse(null);
            System.out.println("找到的数据集对象: " + dataset);
            if (dataset != null) {
                datasetPath = dataset.getStoragePath();
                System.out.println("获取到数据集路径: " + datasetPath);
                System.out.println("数据集路径类型: " + (datasetPath != null ? datasetPath.getClass() : "null"));
                System.out.println("数据集路径长度: " + (datasetPath != null ? datasetPath.length() : "null"));
            } else {
                System.out.println("未找到数据集ID: " + task.getDatasetId());
            }
        } else {
            System.out.println("task.getDatasetId()为null");
        }

        System.out.println("将任务状态设置为training");
        task.setStatus("training");
        task.setProgress(0);
        TrainingTask savedTask = trainingTaskRepository.save(task);
        System.out.println("保存后的任务datasetId: " + savedTask.getDatasetId());

        try {
            String url = PYTHON_TRAINING_SERVICE_URL + "/train";
            System.out.println("调用Python训练服务: " + url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("task_id", taskId);
            requestBody.put("dataset_path", datasetPath);
            requestBody.put("model_type", task.getModelType());
            requestBody.put("epochs", 10);
            
            System.out.println("请求参数: task_id=" + taskId + ", dataset_path=" + datasetPath + ", model_type=" + task.getModelType());
            System.out.println("请求体: " + requestBody);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            System.out.println("发送请求到Python服务...");
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            
            System.out.println("Python训练服务响应: " + response);
            
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                System.out.println("Python训练服务已启动任务: " + taskId);
            } else {
                String message = response != null ? (String) response.get("message") : "未知错误";
                throw new RuntimeException("启动Python训练服务失败: " + message);
            }
        } catch (Exception e) {
            System.err.println("调用Python训练服务失败: " + e.getMessage());
            e.printStackTrace();
            task.setStatus("failed");
            trainingTaskRepository.save(task);
            throw new RuntimeException("启动训练失败: " + e.getMessage());
        }

        return savedTask;
    }

    @Override
    public TrainingTask updateTaskProgress(Long taskId, Integer progress) {
        TrainingTask task = trainingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("训练任务不存在: " + taskId));

        if (!"training".equals(task.getStatus())) {
            throw new RuntimeException("任务不在训练状态: " + task.getStatus());
        }

        if (progress < 0 || progress > 100) {
            throw new RuntimeException("进度值必须在0-100之间");
        }

        task.setProgress(progress);
        return trainingTaskRepository.save(task);
    }

    @Override
    public TrainingTask completeTask(Long taskId, Double accuracy, String modelPath) {
        TrainingTask task = trainingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("训练任务不存在: " + taskId));

        if (!"training".equals(task.getStatus())) {
            throw new RuntimeException("任务不在训练状态: " + task.getStatus());
        }

        task.setStatus("completed");
        task.setProgress(100);
        task.setAccuracy(accuracy);
        task.setCompletedAt(LocalDateTime.now());
        task.setModelPath(modelPath);

        return trainingTaskRepository.save(task);
    }

    @Override
    public TrainingTask failTask(Long taskId, String errorMessage) {
        TrainingTask task = trainingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("训练任务不存在: " + taskId));

        if (!"training".equals(task.getStatus()) && !"pending".equals(task.getStatus())) {
            throw new RuntimeException("任务状态不允许标记为失败: " + task.getStatus());
        }

        task.setStatus("failed");
        task.setDescription(task.getDescription() + "\n失败原因: " + errorMessage);

        return trainingTaskRepository.save(task);
    }
}
