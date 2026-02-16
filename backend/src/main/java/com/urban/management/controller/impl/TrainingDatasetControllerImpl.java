package com.urban.management.controller.impl;

import com.urban.management.controller.TrainingDatasetController;
import com.urban.management.entity.TrainingDataset;
import com.urban.management.service.TrainingDatasetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "训练数据集管理", description = "训练数据集相关接口")
public class TrainingDatasetControllerImpl implements TrainingDatasetController {

    @Autowired
    private TrainingDatasetService trainingDatasetService;

    @Override
    @GetMapping("/datasets")
    public ResponseEntity<Map<String, Object>> getAllDatasets() {
        try {
            List<TrainingDataset> datasets = trainingDatasetService.getAllDatasets();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", datasets);
            response.put("total", datasets.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取数据集列表失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/datasets/{id}")
    public ResponseEntity<Map<String, Object>> getDatasetById(@PathVariable Long id) {
        try {
            TrainingDataset dataset = trainingDatasetService.getDatasetById(id);
            if (dataset == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "数据集不存在");
                return ResponseEntity.status(404).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", dataset);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取数据集详情失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/datasets")
    public ResponseEntity<Map<String, Object>> createDataset(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam Long uploadedBy) {
        try {
            System.out.println("===== 接收到创建数据集请求 =====");
            System.out.println("name: " + name);
            System.out.println("description: " + description);
            System.out.println("uploadedBy: " + uploadedBy);
            System.out.println("files: " + (files != null ? files.length : "null"));
            
            if (files != null) {
                for (int i = 0; i < files.length; i++) {
                    System.out.println("文件 " + i + ": " + files[i].getOriginalFilename() + ", 大小: " + files[i].getSize());
                }
            }
            
            if (name == null || name.isEmpty()) {
                System.out.println("错误: 数据集名称为空");
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "数据集名称不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            System.out.println("开始调用service创建数据集...");
            TrainingDataset dataset = trainingDatasetService.createDataset(name, description, files, uploadedBy);
            System.out.println("数据集创建成功，ID: " + dataset.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "数据集创建成功");
            response.put("data", dataset);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("创建数据集异常: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建数据集失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PutMapping("/datasets/{id}")
    public ResponseEntity<Map<String, Object>> updateDataset(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description) {
        try {
            TrainingDataset dataset = trainingDatasetService.updateDataset(id, name, description);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "数据集更新成功");
            response.put("data", dataset);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新数据集失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @DeleteMapping("/datasets/{id}")
    public ResponseEntity<Map<String, Object>> deleteDataset(@PathVariable Long id) {
        try {
            trainingDatasetService.deleteDataset(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "数据集删除成功");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除数据集失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/datasets/user/{uploadedBy}")
    public ResponseEntity<Map<String, Object>> getDatasetsByUploadedBy(@PathVariable Long uploadedBy) {
        try {
            List<TrainingDataset> datasets = trainingDatasetService.getDatasetsByUploadedBy(uploadedBy);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", datasets);
            response.put("total", datasets.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取用户数据集失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/datasets/available")
    public ResponseEntity<Map<String, Object>> getAvailableDatasets() {
        try {
            List<TrainingDataset> datasets = trainingDatasetService.getAvailableDatasets();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", datasets);
            response.put("total", datasets.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取可用数据集失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @PostMapping("/datasets/{id}/add-files")
    public ResponseEntity<Map<String, Object>> addFilesToDataset(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) {
        try {
            System.out.println("===== 接收到向数据集添加文件请求 =====");
            System.out.println("数据集ID: " + id);
            System.out.println("文件数量: " + (files != null ? files.length : 0));
            
            if (files != null) {
                for (int i = 0; i < files.length; i++) {
                    System.out.println("文件 " + i + ": " + files[i].getOriginalFilename() + ", 大小: " + files[i].getSize());
                }
            }
            
            TrainingDataset dataset = trainingDatasetService.addFilesToDataset(id, files);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "文件添加成功");
            response.put("data", dataset);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("向数据集添加文件异常: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "向数据集添加文件失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @DeleteMapping("/datasets/{id}/remove-files")
    public ResponseEntity<Map<String, Object>> removeFilesFromDataset(
            @PathVariable Long id,
            @RequestParam("fileNames") String[] fileNames) {
        try {
            System.out.println("===== 接收到从数据集删除文件请求 =====");
            System.out.println("数据集ID: " + id);
            System.out.println("要删除的文件数量: " + (fileNames != null ? fileNames.length : 0));
            
            if (fileNames != null) {
                for (int i = 0; i < fileNames.length; i++) {
                    System.out.println("文件 " + i + ": " + fileNames[i]);
                }
            }
            
            TrainingDataset dataset = trainingDatasetService.removeFilesFromDataset(id, fileNames);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "文件删除成功");
            response.put("data", dataset);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("从数据集删除文件异常: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "从数据集删除文件失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @GetMapping("/datasets/{id}/files")
    public ResponseEntity<Map<String, Object>> getDatasetFiles(@PathVariable Long id) {
        try {
            System.out.println("===== 接收到获取数据集文件列表请求 =====");
            System.out.println("数据集ID: " + id);
            
            List<String> files = trainingDatasetService.getDatasetFiles(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "获取文件列表成功");
            response.put("data", files);
            response.put("total", files.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("获取数据集文件列表异常: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取数据集文件列表失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
