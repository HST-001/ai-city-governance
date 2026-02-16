package com.urban.management.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "训练任务管理", description = "训练任务相关接口")
public interface TrainingTaskController {

    @Operation(summary = "获取所有训练任务", description = "获取系统中所有的训练任务")
    @GetMapping("/training-tasks")
    ResponseEntity<Map<String, Object>> getAllTasks();

    @Operation(summary = "获取任务详情", description = "根据ID获取训练任务的详细信息")
    @GetMapping("/training-tasks/{id}")
    ResponseEntity<Map<String, Object>> getTaskById(
            @Parameter(description = "任务ID") @PathVariable Long id);

    @Operation(summary = "创建训练任务", description = "创建新的训练任务")
    @PostMapping("/training-tasks")
    ResponseEntity<Map<String, Object>> createTask(
            @Parameter(description = "任务名称") @RequestParam String name,
            @Parameter(description = "任务描述") @RequestParam(required = false) String description,
            @Parameter(description = "模型类型") @RequestParam String modelType,
            @Parameter(description = "回归头类型") @RequestParam(required = false) String regressionHead,
            @Parameter(description = "训练用户ID") @RequestParam Long trainedBy,
            @Parameter(description = "数据集ID") @RequestParam(required = false) Long datasetId);

    @Operation(summary = "更新任务", description = "更新训练任务的名称和描述")
    @PutMapping("/training-tasks/{id}")
    ResponseEntity<Map<String, Object>> updateTask(
            @Parameter(description = "任务ID") @PathVariable Long id,
            @Parameter(description = "任务名称") @RequestParam(required = false) String name,
            @Parameter(description = "任务描述") @RequestParam(required = false) String description);

    @Operation(summary = "删除任务", description = "删除指定的训练任务")
    @DeleteMapping("/training-tasks/{id}")
    ResponseEntity<Map<String, Object>> deleteTask(
            @Parameter(description = "任务ID") @PathVariable Long id);

    @Operation(summary = "获取用户的训练任务", description = "获取指定用户创建的所有训练任务")
    @GetMapping("/training-tasks/user/{trainedBy}")
    ResponseEntity<Map<String, Object>> getTasksByTrainedBy(
            @Parameter(description = "用户ID") @PathVariable Long trainedBy);

    @Operation(summary = "获取指定状态的任务", description = "获取指定状态的所有训练任务")
    @GetMapping("/training-tasks/status/{status}")
    ResponseEntity<Map<String, Object>> getTasksByStatus(
            @Parameter(description = "任务状态") @PathVariable String status);

    @Operation(summary = "获取指定类型的任务", description = "获取指定模型类型的所有训练任务")
    @GetMapping("/training-tasks/type/{modelType}")
    ResponseEntity<Map<String, Object>> getTasksByModelType(
            @Parameter(description = "模型类型") @PathVariable String modelType);

    @Operation(summary = "开始训练", description = "开始执行训练任务")
    @PostMapping("/training-tasks/{id}/start")
    ResponseEntity<Map<String, Object>> startTraining(
            @Parameter(description = "任务ID") @PathVariable Long id);

    @Operation(summary = "更新训练进度", description = "更新训练任务的进度")
    @PutMapping("/training-tasks/{id}/progress")
    ResponseEntity<Map<String, Object>> updateTaskProgress(
            @Parameter(description = "任务ID") @PathVariable Long id,
            @Parameter(description = "进度(0-100)") @RequestParam Integer progress);

    @Operation(summary = "完成任务", description = "标记训练任务为完成")
    @PostMapping("/training-tasks/{id}/complete")
    ResponseEntity<Map<String, Object>> completeTask(
            @Parameter(description = "任务ID") @PathVariable Long id,
            @Parameter(description = "准确率") @RequestParam Double accuracy,
            @Parameter(description = "模型路径") @RequestParam String modelPath);

    @Operation(summary = "标记任务失败", description = "标记训练任务为失败")
    @PostMapping("/training-tasks/{id}/fail")
    ResponseEntity<Map<String, Object>> failTask(
            @Parameter(description = "任务ID") @PathVariable Long id,
            @Parameter(description = "失败原因") @RequestParam String errorMessage);

    @Operation(summary = "开始评级", description = "使用训练好的模型对图片进行评分")
    @PostMapping("/training-tasks/{id}/rate")
    ResponseEntity<Map<String, Object>> startRating(
            @Parameter(description = "任务ID") @PathVariable Long id,
            @Parameter(description = "图片文件") @RequestParam("file") org.springframework.web.multipart.MultipartFile file);
}
