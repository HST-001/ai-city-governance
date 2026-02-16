package com.urban.management.dto.response;

import java.util.List;

/**
 * 评分响应类
 */
public class RatingResponse {
    // 评分结果
    private RatingResult rating;
    // 比较结果
    private ComparisonResult comparison;
    // 建议列表
    private List<Suggestion> suggestions;
    // 配置信息
    private RatingConfig config;
    
    public RatingResponse() {
    }
    
    public RatingResponse(RatingResult rating, ComparisonResult comparison,
                         List<Suggestion> suggestions, RatingConfig config) {
        this.rating = rating;
        this.comparison = comparison;
        this.suggestions = suggestions;
        this.config = config;
    }
    
    // Getters and Setters
    public RatingResult getRating() {
        return rating;
    }
    
    public void setRating(RatingResult rating) {
        this.rating = rating;
    }
    
    public ComparisonResult getComparison() {
        return comparison;
    }
    
    public void setComparison(ComparisonResult comparison) {
        this.comparison = comparison;
    }
    
    public List<Suggestion> getSuggestions() {
        return suggestions;
    }
    
    public void setSuggestions(List<Suggestion> suggestions) {
        this.suggestions = suggestions;
    }
    
    public RatingConfig getConfig() {
        return config;
    }
    
    public void setConfig(RatingConfig config) {
        this.config = config;
    }
}

/**
 * 比较结果
 */
class ComparisonResult {
    private double overallChange;
    private java.util.Map<String, DimensionComparison> dimensionChanges;
    private int previousRatingCount;
    
    public ComparisonResult() {
    }
    
    public ComparisonResult(double overallChange, java.util.Map<String, DimensionComparison> dimensionChanges,
                           int previousRatingCount) {
        this.overallChange = overallChange;
        this.dimensionChanges = dimensionChanges;
        this.previousRatingCount = previousRatingCount;
    }
    
    // Getters and Setters
    public double getOverallChange() {
        return overallChange;
    }
    
    public void setOverallChange(double overallChange) {
        this.overallChange = overallChange;
    }
    
    public java.util.Map<String, DimensionComparison> getDimensionChanges() {
        return dimensionChanges;
    }
    
    public void setDimensionChanges(java.util.Map<String, DimensionComparison> dimensionChanges) {
        this.dimensionChanges = dimensionChanges;
    }
    
    public int getPreviousRatingCount() {
        return previousRatingCount;
    }
    
    public void setPreviousRatingCount(int previousRatingCount) {
        this.previousRatingCount = previousRatingCount;
    }
}

/**
 * 维度比较
 */
class DimensionComparison {
    private String id;
    private double scoreChange;
    private double previousScore;
    private double currentScore;
    
    public DimensionComparison() {
    }
    
    public DimensionComparison(String id, double scoreChange, double previousScore,
                             double currentScore) {
        this.id = id;
        this.scoreChange = scoreChange;
        this.previousScore = previousScore;
        this.currentScore = currentScore;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public double getScoreChange() {
        return scoreChange;
    }
    
    public void setScoreChange(double scoreChange) {
        this.scoreChange = scoreChange;
    }
    
    public double getPreviousScore() {
        return previousScore;
    }
    
    public void setPreviousScore(double previousScore) {
        this.previousScore = previousScore;
    }
    
    public double getCurrentScore() {
        return currentScore;
    }
    
    public void setCurrentScore(double currentScore) {
        this.currentScore = currentScore;
    }
}

/**
 * 建议信息
 */
class Suggestion {
    private String id;
    private String type;
    private String title;
    private String description;
    private int priority;
    private boolean actionable;
    
    public Suggestion() {
    }
    
    public Suggestion(String id, String type, String title, String description,
                     int priority, boolean actionable) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.actionable = actionable;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public int getPriority() {
        return priority;
    }
    
    public void setPriority(int priority) {
        this.priority = priority;
    }
    
    public boolean isActionable() {
        return actionable;
    }
    
    public void setActionable(boolean actionable) {
        this.actionable = actionable;
    }
}
