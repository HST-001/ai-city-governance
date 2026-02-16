package com.urban.management.dto.request;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 评分请求参数
 */
public class RatingRequest {
    // 评分参数，可用于调整评分算法的行为
    private Map<String, Object> parameters = new HashMap<>();
    // 是否启用高级分析
    private boolean enableAdvancedAnalysis = false;
    // 关注的特定维度列表
    private List<String> focusDimensions;
    // 评分版本
    private String version = "latest";
    
    // Getters and Setters
    public Map<String, Object> getParameters() {
        return parameters;
    }
    
    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }
    
    public boolean isEnableAdvancedAnalysis() {
        return enableAdvancedAnalysis;
    }
    
    public void setEnableAdvancedAnalysis(boolean enableAdvancedAnalysis) {
        this.enableAdvancedAnalysis = enableAdvancedAnalysis;
    }
    
    public List<String> getFocusDimensions() {
        return focusDimensions;
    }
    
    public void setFocusDimensions(List<String> focusDimensions) {
        this.focusDimensions = focusDimensions;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
}

/**
 * 批量评分请求
 */
class BatchRatingRequest {
    // 照片ID列表
    private List<Long> photoIds;
    // 评分请求参数
    private RatingRequest ratingRequest;
    // 是否同步处理
    private boolean synchronous = false;
    // 请求ID，用于异步处理回调
    private String requestId;
    
    // Getters and Setters
    public List<Long> getPhotoIds() {
        return photoIds;
    }
    
    public void setPhotoIds(List<Long> photoIds) {
        this.photoIds = photoIds;
    }
    
    public RatingRequest getRatingRequest() {
        return ratingRequest;
    }
    
    public void setRatingRequest(RatingRequest ratingRequest) {
        this.ratingRequest = ratingRequest;
    }
    
    public boolean isSynchronous() {
        return synchronous;
    }
    
    public void setSynchronous(boolean synchronous) {
        this.synchronous = synchronous;
    }
    
    public String getRequestId() {
        return requestId;
    }
    
    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}

/**
 * 建议请求参数
 */
class SuggestionRequest {
    // 优先级过滤 (high, medium, low)
    private String priority;
    // 建议数量限制
    private Integer limit;
    // 建议类型过滤 (improvement, enhancement, maintenance)
    private String type;
    // 关注的特定维度列表
    private List<String> focusDimensions;
    // 最小影响值
    private Integer minImpact;
    
    // Getters and Setters
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public Integer getLimit() {
        return limit;
    }
    
    public void setLimit(Integer limit) {
        this.limit = limit;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public List<String> getFocusDimensions() {
        return focusDimensions;
    }
    
    public void setFocusDimensions(List<String> focusDimensions) {
        this.focusDimensions = focusDimensions;
    }
    
    public Integer getMinImpact() {
        return minImpact;
    }
    
    public void setMinImpact(Integer minImpact) {
        this.minImpact = minImpact;
    }
}

/**
 * 基于评分结果的建议请求
 */
class SuggestionFromRatingRequest {
    // 使用Map<String, Object>替代RatingResult，避免依赖问题
    private Map<String, Object> ratingResult;
    // 建议请求参数
    private SuggestionRequest suggestionRequest;
    
    // Getters and Setters
    public Map<String, Object> getRatingResult() {
        return ratingResult;
    }
    
    public void setRatingResult(Map<String, Object> ratingResult) {
        this.ratingResult = ratingResult;
    }
    
    public SuggestionRequest getSuggestionRequest() {
        return suggestionRequest;
    }
    
    public void setSuggestionRequest(SuggestionRequest suggestionRequest) {
        this.suggestionRequest = suggestionRequest;
    }
}