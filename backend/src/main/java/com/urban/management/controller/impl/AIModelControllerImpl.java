package com.urban.management.controller.impl;

import com.urban.management.controller.AIModelController;
import com.urban.management.entity.AIModel;
import com.urban.management.service.AIModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "AI模型管理", description = "AI模型相关接口")
public class AIModelControllerImpl implements AIModelController {

    @Autowired
    private AIModelService aiModelService;

    @Override
    @GetMapping("/models")
    public ResponseEntity<Map<String, Object>> getAllModels() {
        try {
            List<AIModel> models = aiModelService.getAllModels();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", models);
            response.put("total", models.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取AI模型列表失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/models/{id}")
    public ResponseEntity<Map<String, Object>> getModelById(@PathVariable Long id) {
        try {
            AIModel model = aiModelService.getModelById(id);
            if (model == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "AI模型不存在");
                return ResponseEntity.status(404).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", model);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取AI模型详情失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/models")
    public ResponseEntity<Map<String, Object>> createModel(
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam(required = false) String description,
            @RequestParam String version,
            @RequestParam Long createdBy,
            @RequestParam(required = false) Long trainingTaskId,
            @RequestParam(required = false) String modelPath,
            @RequestParam(required = false) String trainingDataSize,
            @RequestParam(required = false) Double accuracy) {
        try {
            if (name == null || name.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "模型名称不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            if (type == null || type.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "模型类型不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            if (version == null || version.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "版本号不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            AIModel model = aiModelService.createModel(name, type, description, version, createdBy, trainingTaskId, modelPath, trainingDataSize, accuracy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "AI模型创建成功");
            response.put("data", model);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建AI模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PutMapping("/models/{id}")
    public ResponseEntity<Map<String, Object>> updateModel(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String status) {
        try {
            AIModel model = aiModelService.updateModel(id, name, description, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "AI模型更新成功");
            response.put("data", model);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新AI模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @DeleteMapping("/models/{id}")
    public ResponseEntity<Map<String, Object>> deleteModel(@PathVariable Long id) {
        try {
            aiModelService.deleteModel(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "AI模型删除成功");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除AI模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/models/user/{createdBy}")
    public ResponseEntity<Map<String, Object>> getModelsByCreatedBy(@PathVariable Long createdBy) {
        try {
            List<AIModel> models = aiModelService.getModelsByCreatedBy(createdBy);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", models);
            response.put("total", models.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取用户AI模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/models/status/{status}")
    public ResponseEntity<Map<String, Object>> getModelsByStatus(@PathVariable String status) {
        try {
            List<AIModel> models = aiModelService.getModelsByStatus(status);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", models);
            response.put("total", models.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取指定状态模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/models/type/{type}")
    public ResponseEntity<Map<String, Object>> getModelsByType(@PathVariable String type) {
        try {
            List<AIModel> models = aiModelService.getModelsByType(type);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", models);
            response.put("total", models.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取指定类型模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/models/production")
    public ResponseEntity<Map<String, Object>> getProductionModels() {
        try {
            List<AIModel> models = aiModelService.getProductionModels();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", models);
            response.put("total", models.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取生产环境模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/models/{id}/set-production")
    public ResponseEntity<Map<String, Object>> setProductionModel(@PathVariable Long id) {
        try {
            AIModel model = aiModelService.setProductionModel(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "模型已设置为生产环境");
            response.put("data", model);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "设置生产模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/models/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateModel(@PathVariable Long id) {
        try {
            AIModel model = aiModelService.deactivateModel(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "模型已停用");
            response.put("data", model);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "停用模型失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
