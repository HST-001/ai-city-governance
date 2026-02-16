package com.urban.management.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AI分析结果实体类
 */
@Entity
@Table(name = "analysis_results")
@Schema(description = "AI分析结果实体")
public class AnalysisResult implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "分析结果ID")
    private Long id;

    @OneToOne
    @JoinColumn(name = "photo_id", nullable = false, unique = true)
    @Schema(description = "关联的照片")
    private Photo photo;

    @Column(name = "facility_type", length = 100)
    @Schema(description = "设施类型（店招、行道树、绿化、人行道铺装、自行车道等）")
    private String facilityType;

    @Column(name = "status", length = 100)
    @Schema(description = "状态描述")
    private String status;

    @Column(name = "condition_level", length = 20)
    @Schema(description = "状况等级（A/B/C/D，对应优/良/中/差）")
    private String conditionLevel;

    @Column(name = "confidence_score")
    @Schema(description = "置信度分数")
    private Double confidenceScore;

    @Column(name = "recommended_action", length = 500)
    @Schema(description = "建议采取的措施")
    private String recommendedAction;

    @Column(name = "severity", length = 20)
    @Schema(description = "严重程度（高/中/低）")
    private String severity;

    @Column(name = "estimated_cost")
    @Schema(description = "预估修复成本")
    private Double estimatedCost;

    @Column(name = "analysis_details", columnDefinition = "TEXT")
    @Schema(description = "详细分析结果，JSON格式")
    private String analysisDetails;

    @Column(name = "model_version", length = 50)
    @Schema(description = "使用的AI模型版本")
    private String modelVersion;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Photo getPhoto() {
        return photo;
    }

    public void setPhoto(Photo photo) {
        this.photo = photo;
    }

    public String getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(String facilityType) {
        this.facilityType = facilityType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getConditionLevel() {
        return conditionLevel;
    }

    public void setConditionLevel(String conditionLevel) {
        this.conditionLevel = conditionLevel;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getAnalysisDetails() {
        return analysisDetails;
    }

    public void setAnalysisDetails(String analysisDetails) {
        this.analysisDetails = analysisDetails;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
