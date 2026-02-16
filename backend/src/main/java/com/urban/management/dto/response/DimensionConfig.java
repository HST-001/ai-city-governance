package com.urban.management.dto.response;

/**
 * 维度配置
 */
public class DimensionConfig {
    // 权重（影响总分的比例）
    private double weight;
    // 显示名称
    private String name;
    // 描述
    private String description;
    
    public DimensionConfig() {
    }
    
    public DimensionConfig(double weight, String name, String description) {
        this.weight = weight;
        this.name = name;
        this.description = description;
    }
    
    // Getters and Setters
    public double getWeight() {
        return weight;
    }
    
    public void setWeight(double weight) {
        this.weight = weight;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
