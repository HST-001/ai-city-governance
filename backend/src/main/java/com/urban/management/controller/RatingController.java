package com.urban.management.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 评分控制器接口
 */
@Tag(name = "评分管理", description = "照片评分、配置获取、历史查询等接口")
@RequestMapping("/ratings")
public interface RatingController {

    /**
     * 获取评分配置
     */
    @Operation(summary = "获取评分配置", description = "获取系统评分维度、权重等配置信息")
    @GetMapping("/config")
    ResponseEntity<Map<String, Object>> getRatingConfig();

    /**
     * 对照片进行评分
     */
    @Operation(summary = "对照片评分", description = "对指定照片进行评分")
    @PostMapping("/photos/{photoId}")
    ResponseEntity<Map<String, Object>> ratePhoto(@PathVariable("photoId") Long photoId, @RequestBody Map<String, Object> request);

    /**
     * 批量评分照片
     */
    @Operation(summary = "批量评分照片", description = "批量对多张照片进行评分")
    @PostMapping("/photos/batch")
    ResponseEntity<Map<Long, Map<String, Object>>> batchRatePhotos(@RequestBody Map<String, Object> requestBody);

    /**
     * 获取照片的评分历史
     */
    @Operation(summary = "获取评分历史", description = "获取指定照片的历史评分记录")
    @GetMapping("/photos/{photoId}/history")
    ResponseEntity<List<Map<String, Object>>> getPhotoRatingHistory(@PathVariable("photoId") Long photoId);

    /**
     * 比较两张照片的评分
     */
    @Operation(summary = "比较照片评分", description = "比较两张照片的评分差异")
    @GetMapping("/compare")
    ResponseEntity<Map<String, Object>> comparePhotos(
            @RequestParam("photoId1") Long photoId1,
            @RequestParam("photoId2") Long photoId2,
            @RequestParam(required = false) List<String> dimensions);

    /**
     * 获取评分统计数据
     */
    @Operation(summary = "获取评分统计", description = "获取指定照片集的评分统计信息")
    @GetMapping("/statistics")
    ResponseEntity<Map<String, Object>> getRatingStatistics(@RequestParam("photoIds") List<Long> photoIds);
}
