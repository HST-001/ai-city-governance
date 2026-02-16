package com.urban.management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

/**
 * 照片相关控制器
 */
@RestController
@RequestMapping("/photos")
public interface PhotoController {

    /**
     * 上传照片
     */
    @PostMapping("/upload")
    ResponseEntity<Map<String, Object>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Map<String, String> metadata);

    /**
     * 批量上传照片
     */
    @PostMapping("/upload/batch")
    ResponseEntity<List<Map<String, Object>>> batchUploadPhotos(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String street,
            @RequestParam(required = false) String detailedLocation,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String photoType);

    /**
     * 获取照片详情
     */
    @GetMapping("/{photoId}")
    ResponseEntity<Map<String, Object>> getPhotoDetail(@PathVariable("photoId") Long photoId);

    /**
     * 获取照片列表
     */
    @GetMapping("/")
    ResponseEntity<Map<String, Object>> getPhotoList(
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size,
            @RequestParam(required = false) Map<String, String> filters);

    /**
     * 更新照片信息
     */
    @PutMapping("/{photoId}")
    ResponseEntity<Map<String, Object>> updatePhoto(
            @PathVariable("photoId") Long photoId,
            @RequestBody Map<String, Object> photoUpdateData);

    /**
     * 删除照片
     */
    @DeleteMapping("/{photoId}")
    ResponseEntity<Map<String, Object>> deletePhoto(@PathVariable("photoId") Long photoId);

    /**
     * 批量删除照片
     */
    @DeleteMapping("/batch")
    ResponseEntity<Map<String, Object>> batchDeletePhotos(@RequestBody List<Long> photoIds);

    /**
     * 获取照片的分析结果
     */
    @GetMapping("/{photoId}/analysis")
    ResponseEntity<Map<String, Object>> getPhotoAnalysis(@PathVariable("photoId") Long photoId);

    /**
     * 更新照片评分（包括多维度评分）
     */
    @PutMapping("/{photoId}/rating")
    ResponseEntity<Map<String, Object>> updatePhotoRating(
            @PathVariable("photoId") Long photoId,
            @RequestBody Map<String, Object> ratingData);
}