package com.urban.management.controller.impl;

import com.urban.management.controller.PhotoController;
import com.urban.management.entity.Photo;
import com.urban.management.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * 照片控制器实现类
 */
@RestController
@RequestMapping("/photos")
public class PhotoControllerImpl implements PhotoController {

    @Autowired
    private PhotoService photoService;

    /**
     * 上传照片
     */
    @Override
    public ResponseEntity<Map<String, Object>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Map<String, String> metadata) {
        try {
            Photo photo = new Photo();
            photo.setFileName(file.getOriginalFilename());
            photo.setFileSize(file.getSize());
            photo.setFileType(file.getContentType());
            
            if (metadata != null) {
                if (metadata.containsKey("province")) {
                    photo.setProvince(metadata.get("province"));
                }
                if (metadata.containsKey("city")) {
                    photo.setCity(metadata.get("city"));
                }
                if (metadata.containsKey("district")) {
                    photo.setDistrict(metadata.get("district"));
                }
                if (metadata.containsKey("street")) {
                    photo.setStreetName(metadata.get("street"));
                }
                if (metadata.containsKey("detailedLocation")) {
                    photo.setLocationDescription(metadata.get("detailedLocation"));
                }
                if (metadata.containsKey("description")) {
                    photo.setLocationDescription(metadata.get("description"));
                }
            }
            
            photo.setUploadedBy(1L);
            
            Photo savedPhoto = photoService.savePhoto(photo, file);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "照片上传成功");
            result.put("photoId", savedPhoto.getId());
            result.put("fileName", savedPhoto.getFileName());
            result.put("size", savedPhoto.getFileSize());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("上传照片失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "照片上传失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    @Override
    public ResponseEntity<List<Map<String, Object>>> batchUploadPhotos(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String street,
            @RequestParam(required = false) String detailedLocation,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String photoType) {
        System.out.println("=== 批量上传照片接口被调用 ===");
        System.out.println("文件数量: " + (files != null ? files.size() : "null"));
        if (files != null && !files.isEmpty()) {
            System.out.println("第一个文件名: " + files.get(0).getOriginalFilename());
        }
        System.out.println("位置信息 - 省份: " + province + ", 城市: " + city + ", 区县: " + district + ", 街道: " + street);
        System.out.println("照片类型: " + photoType);
        
        List<Map<String, Object>> results = new ArrayList<>();
        
        if (files == null || files.isEmpty()) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("fileName", "无文件");
            errorResult.put("size", 0);
            errorResult.put("success", false);
            errorResult.put("error", "文件列表为空");
            results.add(errorResult);
            return ResponseEntity.badRequest().body(results);
        }
        
        for (MultipartFile file : files) {
            try {
                Photo photo = new Photo();
                photo.setFileName(file.getOriginalFilename());
                photo.setFileSize(file.getSize());
                photo.setFileType(file.getContentType());
                
                if (province != null && !province.isEmpty()) {
                    photo.setProvince(province);
                }
                if (city != null && !city.isEmpty()) {
                    photo.setCity(city);
                }
                if (district != null && !district.isEmpty()) {
                    photo.setDistrict(district);
                }
                if (street != null && !street.isEmpty()) {
                    photo.setStreetName(street);
                }
                if (detailedLocation != null && !detailedLocation.isEmpty()) {
                    photo.setLocationDescription(detailedLocation);
                }
                if (description != null && !description.isEmpty()) {
                    photo.setLocationDescription(description);
                }
                if (photoType != null && !photoType.isEmpty()) {
                    photo.setPhotoType(photoType);
                }
                
                photo.setUploadedBy(1L);
                
                Photo savedPhoto = photoService.savePhoto(photo, file);
                
                Map<String, Object> fileResult = new HashMap<>();
                fileResult.put("photoId", savedPhoto.getId());
                fileResult.put("fileName", savedPhoto.getFileName());
                fileResult.put("size", savedPhoto.getFileSize());
                fileResult.put("success", true);
                results.add(fileResult);
            } catch (Exception e) {
                System.out.println("保存文件失败: " + file.getOriginalFilename() + ", 错误: " + e.getMessage());
                e.printStackTrace();
                
                Map<String, Object> fileResult = new HashMap<>();
                fileResult.put("fileName", file.getOriginalFilename());
                fileResult.put("size", file.getSize());
                fileResult.put("success", false);
                fileResult.put("error", e.getMessage());
                results.add(fileResult);
            }
        }
        
        return ResponseEntity.ok(results);
    }

    /**
     * 获取照片详情
     */
    @Override
    public ResponseEntity<Map<String, Object>> getPhotoDetail(@PathVariable("photoId") Long photoId) {
        // 简化实现，返回基础响应
        Map<String, Object> result = new HashMap<>();
        result.put("photoId", photoId);
        result.put("message", "获取照片详情成功");
        return ResponseEntity.ok(result);
    }

    /**
     * 获取照片列表
     */
    @Override
    public ResponseEntity<Map<String, Object>> getPhotoList(
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size,
            @RequestParam(required = false) Map<String, String> filters) {
        try {
            String city = filters != null ? filters.get("city") : null;
            String district = filters != null ? filters.get("district") : null;
            String street = filters != null ? filters.get("street") : null;
            String type = filters != null ? filters.get("type") : null;
            String status = filters != null ? filters.get("status") : null;
            
            Page<Photo> photoPage = photoService.getPhotos(page - 1, size, city, district, street, type, status);
            
            List<Map<String, Object>> results = new ArrayList<>();
            for (Photo photo : photoPage.getContent()) {
                Map<String, Object> photoMap = new HashMap<>();
                photoMap.put("id", photo.getId());
                photoMap.put("fileName", photo.getFileName());
                photoMap.put("filePath", photo.getFilePath());
                photoMap.put("fileSize", photo.getFileSize());
                photoMap.put("fileType", photo.getFileType());
                photoMap.put("city", photo.getCity());
                photoMap.put("district", photo.getDistrict());
                photoMap.put("streetName", photo.getStreetName());
                photoMap.put("locationDescription", photo.getLocationDescription());
                photoMap.put("analyzed", photo.getAnalyzed());
                photoMap.put("uploadedBy", photo.getUploadedBy());
                photoMap.put("uploadedAt", photo.getUploadedAt());
                photoMap.put("lastAnalyzedAt", photo.getLastAnalyzedAt());
                photoMap.put("rating", photo.getRating());
                photoMap.put("dimensionScores", photo.getDimensionScores());
                photoMap.put("photoType", photo.getPhotoType());
                results.add(photoMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", results);
            response.put("total", photoPage.getTotalElements());
            response.put("page", page);
            response.put("size", size);
            response.put("totalPages", photoPage.getTotalPages());
            
            System.out.println("=== 返回照片列表 ===");
            System.out.println("照片数量: " + results.size());
            System.out.println("总数: " + photoPage.getTotalElements());
            System.out.println("响应数据: " + response);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("获取照片列表失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取照片列表失败: " + e.getMessage());
            response.put("data", new ArrayList<>());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 更新照片信息
     */
    @Override
    public ResponseEntity<Map<String, Object>> updatePhoto(
            @PathVariable("photoId") Long photoId,
            @RequestBody Map<String, Object> photoUpdateData) {
        try {
            Photo existingPhoto = photoService.getPhotoById(photoId);
            if (existingPhoto == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "照片不存在");
                return ResponseEntity.status(404).body(result);
            }
            
            // 更新照片信息
            if (photoUpdateData.containsKey("rating")) {
                existingPhoto.setRating((Double) photoUpdateData.get("rating"));
            }
            
            Photo updatedPhoto = photoService.updatePhoto(existingPhoto);
            
            Map<String, Object> result = new HashMap<>();
            result.put("photoId", updatedPhoto.getId());
            result.put("success", true);
            result.put("message", "照片信息更新成功");
            result.put("rating", updatedPhoto.getRating());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("更新照片信息失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "更新照片信息失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * 删除照片
     */
    @Override
    public ResponseEntity<Map<String, Object>> deletePhoto(@PathVariable("photoId") Long photoId) {
        try {
            photoService.deletePhoto(photoId);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "照片删除成功");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "删除照片失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * 批量删除照片
     */
    @Override
    public ResponseEntity<Map<String, Object>> batchDeletePhotos(@RequestBody List<Long> photoIds) {
        // 简化实现，返回基础响应
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "批量删除照片成功");
        result.put("deletedCount", photoIds.size());
        return ResponseEntity.ok(result);
    }

    /**
     * 获取照片的分析结果
     */
    @Override
    public ResponseEntity<Map<String, Object>> getPhotoAnalysis(@PathVariable("photoId") Long photoId) {
        // 简化实现，返回基础响应
        Map<String, Object> result = new HashMap<>();
        result.put("photoId", photoId);
        result.put("message", "获取照片分析结果成功");
        return ResponseEntity.ok(result);
    }

    /**
     * 更新照片评分（包括多维度评分）
     */
    @Override
    public ResponseEntity<Map<String, Object>> updatePhotoRating(
            @PathVariable("photoId") Long photoId,
            @RequestBody Map<String, Object> ratingData) {
        try {
            System.out.println("=== 更新照片评分接口被调用 ===");
            System.out.println("照片ID: " + photoId);
            System.out.println("评分数据: " + ratingData);
            
            Double rating = null;
            Object dimensionScores = null;
            
            if (ratingData.containsKey("rating")) {
                rating = Double.valueOf(ratingData.get("rating").toString());
                System.out.println("综合评分: " + rating);
            }
            
            if (ratingData.containsKey("dimensionScores")) {
                dimensionScores = ratingData.get("dimensionScores");
                System.out.println("多维度评分: " + dimensionScores);
            }
            
            if (rating == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "评分不能为空");
                return ResponseEntity.badRequest().body(result);
            }
            
            Photo updatedPhoto = photoService.updatePhotoRating(photoId, rating, dimensionScores);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "照片评分更新成功");
            result.put("photoId", updatedPhoto.getId());
            result.put("rating", updatedPhoto.getRating());
            result.put("dimensionScores", updatedPhoto.getDimensionScores());
            
            System.out.println("评分更新成功，返回结果: " + result);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("更新照片评分失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "更新照片评分失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
}