package com.urban.management.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 评分结果
 */
public class RatingResult {
    private long id;
    private long photoId;
    private LocalDateTime timestamp;
    private double overallScore;
    private double maxScore;
    private Map<String, DimensionRating> dimensions;
    private String feedback;
    private Map<String, Object> parameters;
    private String modelVersion;
    
    public RatingResult() {
    }
    
    public RatingResult(long id, long photoId, LocalDateTime timestamp, double overallScore, double maxScore,
                       Map<String, DimensionRating> dimensions, String feedback,
                       Map<String, Object> parameters, String modelVersion) {
        this.id = id;
        this.photoId = photoId;
        this.timestamp = timestamp;
        this.overallScore = overallScore;
        this.maxScore = maxScore;
        this.dimensions = dimensions;
        this.feedback = feedback;
        this.parameters = parameters;
        this.modelVersion = modelVersion;
    }
    
    // Getters and Setters
    public long getId() {
        return id;
    }
    
    public void setId(long id) {
        this.id = id;
    }
    
    public long getPhotoId() {
        return photoId;
    }
    
    public void setPhotoId(long photoId) {
        this.photoId = photoId;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public double getOverallScore() {
        return overallScore;
    }
    
    public void setOverallScore(double overallScore) {
        this.overallScore = overallScore;
    }
    
    public double getMaxScore() {
        return maxScore;
    }
    
    public void setMaxScore(double maxScore) {
        this.maxScore = maxScore;
    }
    
    public Map<String, DimensionRating> getDimensions() {
        return dimensions;
    }
    
    public void setDimensions(Map<String, DimensionRating> dimensions) {
        this.dimensions = dimensions;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
    
    public Map<String, Object> getParameters() {
        return parameters;
    }
    
    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }
    
    public String getModelVersion() {
        return modelVersion;
    }
    
    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}

/**
 * 维度评分
 */
class DimensionRating {
    private String id;
    private double score;
    private double maxScore;
    private double weight;
    private String description;
    private java.util.List<String> tips;
    
    public DimensionRating() {
    }
    
    public DimensionRating(String id, double score, double maxScore, double weight,
                          String description, java.util.List<String> tips) {
        this.id = id;
        this.score = score;
        this.maxScore = maxScore;
        this.weight = weight;
        this.description = description;
        this.tips = tips;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public double getScore() {
        return score;
    }
    
    public void setScore(double score) {
        this.score = score;
    }
    
    public double getMaxScore() {
        return maxScore;
    }
    
    public void setMaxScore(double maxScore) {
        this.maxScore = maxScore;
    }
    
    public double getWeight() {
        return weight;
    }
    
    public void setWeight(double weight) {
        this.weight = weight;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public java.util.List<String> getTips() {
        return tips;
    }
    
    public void setTips(java.util.List<String> tips) {
        this.tips = tips;
    }
}
