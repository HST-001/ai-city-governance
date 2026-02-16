package com.urban.management.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "AI模型管理", description = "AI模型相关接口")
public interface AIModelController {

    @Operation(summary = "获取所有模型", description = "获取系统中所有的AI模型")
    @GetMapping("/models")
    ResponseEntity<Map<String, Object>> getAllModels();

    @Operation(summary = "获取模型详情", description = "根据ID获取AI模型的详细信息")
    @GetMapping("/models/{id}")
    ResponseEntity<Map<String, Object>> getModelById(
            @Parameter(description = "模型ID") @PathVariable Long id);

    @Operation(summary = "创建模型", description = "创建新的AI模型")
    @PostMapping("/models")
    ResponseEntity<Map<String, Object>> createModel(
            @Parameter(description = "模型名称") @RequestParam String name,
            @Parameter(description = "模型类型") @RequestParam String type,
            @Parameter(description = "模型描述") @RequestParam(required = false) String description,
            @Parameter(description = "版本号") @RequestParam String version,
            @Parameter(description = "创建用户ID") @RequestParam Long createdBy,
            @Parameter(description = "训练任务ID") @RequestParam(required = false) Long trainingTaskId,
            @Parameter(description = "模型路径") @RequestParam(required = false) String modelPath,
            @Parameter(description = "训练数据大小") @RequestParam(required = false) String trainingDataSize,
            @Parameter(description = "准确率") @RequestParam(required = false) Double accuracy);

    @Operation(summary = "更新模型", description = "更新AI模型的名称、描述和状态")
    @PutMapping("/models/{id}")
    ResponseEntity<Map<String, Object>> updateModel(
            @Parameter(description = "模型ID") @PathVariable Long id,
            @Parameter(description = "模型名称") @RequestParam(required = false) String name,
            @Parameter(description = "模型描述") @RequestParam(required = false) String description,
            @Parameter(description = "模型状态") @RequestParam(required = false) String status);

    @Operation(summary = "删除模型", description = "删除指定的AI模型")
    @DeleteMapping("/models/{id}")
    ResponseEntity<Map<String, Object>> deleteModel(
            @Parameter(description = "模型ID") @PathVariable Long id);

    @Operation(summary = "获取用户的模型", description = "获取指定用户创建的所有AI模型")
    @GetMapping("/models/user/{createdBy}")
    ResponseEntity<Map<String, Object>> getModelsByCreatedBy(
            @Parameter(description = "用户ID") @PathVariable Long createdBy);

    @Operation(summary = "获取指定状态的模型", description = "获取指定状态的所有AI模型")
    @GetMapping("/models/status/{status}")
    ResponseEntity<Map<String, Object>> getModelsByStatus(
            @Parameter(description = "模型状态") @PathVariable String status);

    @Operation(summary = "获取指定类型的模型", description = "获取指定模型类型的所有AI模型")
    @GetMapping("/models/type/{type}")
    ResponseEntity<Map<String, Object>> getModelsByType(
            @Parameter(description = "模型类型") @PathVariable String type);

    @Operation(summary = "获取生产环境模型", description = "获取所有标记为生产环境的AI模型")
    @GetMapping("/models/production")
    ResponseEntity<Map<String, Object>> getProductionModels();

    @Operation(summary = "设置为生产模型", description = "将指定模型设置为生产环境模型")
    @PostMapping("/models/{id}/set-production")
    ResponseEntity<Map<String, Object>> setProductionModel(
            @Parameter(description = "模型ID") @PathVariable Long id);

    @Operation(summary = "停用模型", description = "停用指定的AI模型")
    @PostMapping("/models/{id}/deactivate")
    ResponseEntity<Map<String, Object>> deactivateModel(
            @Parameter(description = "模型ID") @PathVariable Long id);
}
