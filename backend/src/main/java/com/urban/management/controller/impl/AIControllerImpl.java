package com.urban.management.controller.impl;

import com.urban.management.controller.AIController;
import com.urban.management.entity.Photo;
import com.urban.management.service.AIService;
import com.urban.management.service.PhotoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI功能控制器实现类
 */
@RestController
@RequestMapping("/ai")
public class AIControllerImpl implements AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIControllerImpl.class);
    
    private final AIService aiService;
    private final PhotoService photoService;
    
    @Autowired
    public AIControllerImpl(AIService aiService, PhotoService photoService) {
        this.aiService = aiService;
        this.photoService = photoService;
    }

    @Override
    public ResponseEntity<List<String>> generateSuggestions(Long photoId) {
        try {
            Photo photo = photoService.getPhotoById(photoId);
            List<String> suggestions = aiService.generateSuggestions(photo);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            logger.error("生成建议失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> scoreImage(MultipartFile file, String category) {
        try {
            Map<String, Object> result = aiService.scoreImage(file, category);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage());
            return new ResponseEntity<>(errorResult, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<List<Map<String, Object>>> batchScoreImages(List<MultipartFile> files) {
        try {
            List<Map<String, Object>> results = aiService.batchScoreImages(files);
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<List<Double>> extractFeatures(MultipartFile file) {
        try {
            List<Double> features = aiService.extractFeatures(file);
            return new ResponseEntity<>(features, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<Map<String, Double>> analyzeUrbanElements(MultipartFile file) {
        try {
            Map<String, Double> elements = aiService.analyzeUrbanElements(file);
            return new ResponseEntity<>(elements, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> comparePhotos(MultipartFile file1, MultipartFile file2) {
        try {
            Map<String, Object> comparison = aiService.comparePhotos(file1, file2);
            return new ResponseEntity<>(comparison, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<Double> getAestheticScore(MultipartFile file) {
        try {
            Double score = aiService.getAestheticScore(file);
            return new ResponseEntity<>(score, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<Map<String, String>> getModelInfo() {
        try {
            Map<String, String> modelInfo = aiService.getModelInfo();
            return new ResponseEntity<>(modelInfo, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}