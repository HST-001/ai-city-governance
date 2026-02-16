package com.urban.management.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Tag(name = "训练数据集管理", description = "训练数据集相关接口")
public interface TrainingDatasetController {

    @Operation(summary = "获取所有数据集", description = "获取系统中所有的训练数据集")
    @GetMapping("/datasets")
    ResponseEntity<Map<String, Object>> getAllDatasets();

    @Operation(summary = "获取数据集详情", description = "根据ID获取数据集的详细信息")
    @GetMapping("/datasets/{id}")
    ResponseEntity<Map<String, Object>> getDatasetById(
            @Parameter(description = "数据集ID") @PathVariable Long id);

    @Operation(summary = "创建数据集", description = "上传文件并创建新的训练数据集")
    @PostMapping("/datasets")
    ResponseEntity<Map<String, Object>> createDataset(
            @Parameter(description = "数据集名称") @RequestParam String name,
            @Parameter(description = "数据集描述") @RequestParam(required = false) String description,
            @Parameter(description = "上传的文件") @RequestParam("files") MultipartFile[] files,
            @Parameter(description = "上传用户ID") @RequestParam Long uploadedBy);

    @Operation(summary = "更新数据集", description = "更新数据集的名称和描述")
    @PutMapping("/datasets/{id}")
    ResponseEntity<Map<String, Object>> updateDataset(
            @Parameter(description = "数据集ID") @PathVariable Long id,
            @Parameter(description = "数据集名称") @RequestParam(required = false) String name,
            @Parameter(description = "数据集描述") @RequestParam(required = false) String description);

    @Operation(summary = "删除数据集", description = "删除指定的数据集及其关联文件")
    @DeleteMapping("/datasets/{id}")
    ResponseEntity<Map<String, Object>> deleteDataset(
            @Parameter(description = "数据集ID") @PathVariable Long id);

    @Operation(summary = "获取用户的数据集", description = "获取指定用户上传的所有数据集")
    @GetMapping("/datasets/user/{uploadedBy}")
    ResponseEntity<Map<String, Object>> getDatasetsByUploadedBy(
            @Parameter(description = "用户ID") @PathVariable Long uploadedBy);

    @Operation(summary = "获取可用数据集", description = "获取状态为可用的数据集列表")
    @GetMapping("/datasets/available")
    ResponseEntity<Map<String, Object>> getAvailableDatasets();

    @Operation(summary = "向数据集添加文件", description = "向已有数据集添加新的文件")
    @PostMapping("/datasets/{id}/add-files")
    ResponseEntity<Map<String, Object>> addFilesToDataset(
            @Parameter(description = "数据集ID") @PathVariable Long id,
            @Parameter(description = "上传的文件") @RequestParam("files") MultipartFile[] files);

    @Operation(summary = "从数据集删除文件", description = "从数据集中删除指定的文件")
    @DeleteMapping("/datasets/{id}/remove-files")
    ResponseEntity<Map<String, Object>> removeFilesFromDataset(
            @Parameter(description = "数据集ID") @PathVariable Long id,
            @Parameter(description = "要删除的文件名列表") @RequestParam("fileNames") String[] fileNames);

    @Operation(summary = "获取数据集文件列表", description = "获取指定数据集中的所有文件名")
    @GetMapping("/datasets/{id}/files")
    ResponseEntity<Map<String, Object>> getDatasetFiles(
            @Parameter(description = "数据集ID") @PathVariable Long id);
}
