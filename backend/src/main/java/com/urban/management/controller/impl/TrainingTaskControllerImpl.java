package com.urban.management.controller.impl;

import com.urban.management.controller.TrainingTaskController;
import com.urban.management.entity.TrainingTask;
import com.urban.management.service.TrainingTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "训练任务管理", description = "训练任务相关接口")
public class TrainingTaskControllerImpl implements TrainingTaskController {

    @Autowired
    private TrainingTaskService trainingTaskService;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    @GetMapping("/training-tasks")
    public ResponseEntity<Map<String, Object>> getAllTasks() {
        try {
            List<TrainingTask> tasks = trainingTaskService.getAllTasks();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tasks);
            response.put("total", tasks.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取训练任务列表失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/training-tasks/{id}")
    public ResponseEntity<Map<String, Object>> getTaskById(@PathVariable Long id) {
        try {
            TrainingTask task = trainingTaskService.getTaskById(id);
            if (task == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "训练任务不存在");
                return ResponseEntity.status(404).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", task);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取训练任务详情失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/training-tasks")
    public ResponseEntity<Map<String, Object>> createTask(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam String modelType,
            @RequestParam(required = false) String regressionHead,
            @RequestParam Long trainedBy,
            @RequestParam(required = false) Long datasetId) {
        try {
            if (name == null || name.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "任务名称不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            if (modelType == null || modelType.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "模型类型不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            TrainingTask task = trainingTaskService.createTask(name, description, modelType, trainedBy, datasetId, regressionHead);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "训练任务创建成功");
            response.put("data", task);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建训练任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PutMapping("/training-tasks/{id}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description) {
        try {
            TrainingTask task = trainingTaskService.updateTask(id, name, description);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "训练任务更新成功");
            response.put("data", task);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新训练任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @DeleteMapping("/training-tasks/{id}")
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable Long id) {
        try {
            trainingTaskService.deleteTask(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "训练任务删除成功");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除训练任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/training-tasks/user/{trainedBy}")
    public ResponseEntity<Map<String, Object>> getTasksByTrainedBy(@PathVariable Long trainedBy) {
        try {
            List<TrainingTask> tasks = trainingTaskService.getTasksByTrainedBy(trainedBy);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tasks);
            response.put("total", tasks.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取用户训练任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/training-tasks/status/{status}")
    public ResponseEntity<Map<String, Object>> getTasksByStatus(@PathVariable String status) {
        try {
            List<TrainingTask> tasks = trainingTaskService.getTasksByStatus(status);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tasks);
            response.put("total", tasks.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取指定状态任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/training-tasks/type/{modelType}")
    public ResponseEntity<Map<String, Object>> getTasksByModelType(@PathVariable String modelType) {
        try {
            List<TrainingTask> tasks = trainingTaskService.getTasksByModelType(modelType);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tasks);
            response.put("total", tasks.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取指定类型任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/training-tasks/{id}/start")
    public ResponseEntity<Map<String, Object>> startTraining(@PathVariable Long id) {
        try {
            TrainingTask task = trainingTaskService.startTraining(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "训练任务已开始");
            response.put("data", task);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "开始训练失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PutMapping("/training-tasks/{id}/progress")
    public ResponseEntity<Map<String, Object>> updateTaskProgress(
            @PathVariable Long id,
            @RequestParam Integer progress) {
        try {
            TrainingTask task = trainingTaskService.updateTaskProgress(id, progress);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "训练进度已更新");
            response.put("data", task);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新训练进度失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/training-tasks/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(
            @PathVariable Long id,
            @RequestParam Double accuracy,
            @RequestParam String modelPath) {
        try {
            TrainingTask task = trainingTaskService.completeTask(id, accuracy, modelPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "训练任务已完成");
            response.put("data", task);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "完成任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/training-tasks/{id}/fail")
    public ResponseEntity<Map<String, Object>> failTask(
            @PathVariable Long id,
            @RequestParam String errorMessage) {
        try {
            TrainingTask task = trainingTaskService.failTask(id, errorMessage);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "训练任务已标记为失败");
            response.put("data", task);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "标记任务失败时出错: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/training-tasks/{id}/rate")
    public ResponseEntity<Map<String, Object>> startRating(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            TrainingTask task = trainingTaskService.getTaskById(id);
            if (task == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "训练任务不存在");
                return ResponseEntity.status(404).body(response);
            }

            if (!"completed".equals(task.getStatus())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "只有已完成的训练任务才能进行评级");
                return ResponseEntity.badRequest().body(response);
            }

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            org.springframework.http.HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new org.springframework.http.HttpEntity<>(body, headers);

            String flaskApiUrl = "http://localhost:5000/predict";
            Map<String, Object> flaskResponse = restTemplate.postForObject(flaskApiUrl, requestEntity, Map.class);

            Map<String, Object> response = new HashMap<>();
            if (flaskResponse != null && "success".equals(flaskResponse.get("status"))) {
                response.put("success", true);
                response.put("message", "评级完成");
                response.put("data", flaskResponse);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", flaskResponse != null ? flaskResponse.get("message") : "评级失败");
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "评级失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
