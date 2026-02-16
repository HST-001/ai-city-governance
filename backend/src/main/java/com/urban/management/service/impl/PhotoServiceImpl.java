package com.urban.management.service.impl;

import com.urban.management.entity.Photo;
import com.urban.management.repository.PhotoRepository;
import com.urban.management.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PhotoServiceImpl implements PhotoService {

    @Autowired
    private PhotoRepository photoRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Photo savePhoto(Photo photo, MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                photo.setFileName(file.getOriginalFilename());
                photo.setFileSize(file.getSize());
                photo.setFileType(file.getContentType());
                photo.setFilePath("/uploads/" + file.getOriginalFilename());
                
                // 实际保存文件到项目根目录的uploads目录
                String uploadDir = System.getProperty("user.dir") + "/../uploads";
                java.io.File dir = new java.io.File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                java.io.File destFile = new java.io.File(dir, file.getOriginalFilename());
                file.transferTo(destFile);
                System.out.println("文件保存成功: " + destFile.getAbsolutePath());
            }
            return photoRepository.save(photo);
        } catch (Exception e) {
            System.out.println("保存照片失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("保存照片失败: " + e.getMessage());
        }
    }

    @Override
    public Page<Photo> getPhotos(int page, int size, String city, String district, String street, String type, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
        
        if (type != null && !type.isEmpty()) {
            return photoRepository.findByPhotoType(type, pageable);
        }
        
        if (city != null && !city.isEmpty()) {
            return photoRepository.findByCity(city, pageable);
        }
        
        return photoRepository.findAll(pageable);
    }

    @Override
    public Photo getPhotoById(Long id) {
        return photoRepository.findById(id).orElse(null);
    }

    @Override
    public Photo updatePhoto(Photo photo) {
        return photoRepository.save(photo);
    }

    @Override
    public void deletePhoto(Long id) {
        photoRepository.deleteById(id);
    }

    @Override
    public void batchDeletePhotos(java.util.List<Long> ids) {
        photoRepository.deleteAllById(ids);
    }

    @Override
    public java.util.List<String> getHotCities() {
        // 简化实现，返回示例数据
        return Arrays.asList("北京", "上海", "广州", "深圳", "杭州");
    }

    @Override
    public java.util.List<String> getDistrictsByCity(String city) {
        // 简化实现，返回示例数据
        return Arrays.asList("朝阳区", "海淀区", "东城区", "西城区", "丰台区");
    }

    @Override
    public java.util.List<String> getStreetsByCityAndDistrict(String city, String district) {
        // 简化实现，返回示例数据
        return Arrays.asList("建国门外街道", "望京街道", "三里屯街道", "团结湖街道");
    }

    @Override
    public String getFilePath(String fileName) {
        // 简化实现，返回示例路径
        // 实际应基于配置的文件存储路径构建完整路径
        return "/storage/photos/" + fileName;
    }

    @Override
    public Photo updatePhotoRating(Long photoId, Double rating, Object dimensionScores) {
        try {
            Photo photo = photoRepository.findById(photoId).orElseThrow(() -> 
                new RuntimeException("照片不存在: " + photoId)
            );
            
            // 更新综合评分
            photo.setRating(rating);
            
            // 更新多维度评分
            if (dimensionScores != null) {
                JsonNode dimensionScoresNode = objectMapper.valueToTree(dimensionScores);
                photo.setDimensionScores(dimensionScoresNode);
            }
            
            return photoRepository.save(photo);
        } catch (Exception e) {
            System.out.println("更新照片评分失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("更新照片评分失败: " + e.getMessage());
        }
    }
}
