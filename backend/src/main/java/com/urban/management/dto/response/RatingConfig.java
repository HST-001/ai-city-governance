package com.urban.management.dto.response;

import java.util.Map;

/**
 * 评分配置信息
 */
public class RatingConfig {
    // 满分分数
    private double maxScore;
    // 维度配置映射
    private Map<String, DimensionConfig> dimensions;
    // 批量评分最小数量
    private int minPhotosForBatch;
    // 批量评分最大数量
    private int maxPhotosForBatch;
    
    public RatingConfig() {
    }
    
    public RatingConfig(double maxScore, Map<String, DimensionConfig> dimensions,
                       int minPhotosForBatch, int maxPhotosForBatch) {
        this.maxScore = maxScore;
        this.dimensions = dimensions;
        this.minPhotosForBatch = minPhotosForBatch;
        this.maxPhotosForBatch = maxPhotosForBatch;
    }
    
    // Getters and Setters
    public double getMaxScore() {
        return maxScore;
    }
    
    public void setMaxScore(double maxScore) {
        this.maxScore = maxScore;
    }
    
    public Map<String, DimensionConfig> getDimensions() {
        return dimensions;
    }
    
    public void setDimensions(Map<String, DimensionConfig> dimensions) {
        this.dimensions = dimensions;
    }
    
    public int getMinPhotosForBatch() {
        return minPhotosForBatch;
    }
    
    public void setMinPhotosForBatch(int minPhotosForBatch) {
        this.minPhotosForBatch = minPhotosForBatch;
    }
    
    public int getMaxPhotosForBatch() {
        return maxPhotosForBatch;
    }
    
    public void setMaxPhotosForBatch(int maxPhotosForBatch) {
        this.maxPhotosForBatch = maxPhotosForBatch;
    }
}
