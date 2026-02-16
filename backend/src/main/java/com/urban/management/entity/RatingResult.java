package com.urban.management.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "rating_results")
@Schema(description = "评分结果实体")
public class RatingResult implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "评分结果ID")
    private Long id;

    @Column(name = "model_id", nullable = false)
    @Schema(description = "使用的模型ID")
    private Long modelId;

    @Column(name = "model_name", nullable = false, length = 255)
    @Schema(description = "模型名称")
    private String modelName;

    @Column(name = "overall_rating", nullable = false)
    @Schema(description = "综合评分(0-5)")
    private Double overallRating;

    @Column(name = "confidence", nullable = false)
    @Schema(description = "置信度(0-100)")
    private Double confidence;

    @Column(name = "analyzed_at", nullable = false, updatable = false)
    @Schema(description = "分析时间")
    private LocalDateTime analyzedAt;

    @Column(name = "shop_sign_building", nullable = false)
    @Schema(description = "店招/建筑美观度(0-5)")
    private Double shopSignBuilding;

    @Column(name = "greenery_maintenance", nullable = false)
    @Schema(description = "绿化养护达标度(0-5)")
    private Double greeneryMaintenance;

    @Column(name = "greenery_coverage", nullable = false)
    @Schema(description = "绿化覆盖率(0-5)")
    private Double greeneryCoverage;

    @Column(name = "sidewalk_damage", nullable = false)
    @Schema(description = "人行道破损程度(0-5)")
    private Double sidewalkDamage;

    @Column(name = "bike_lane_connectivity", nullable = false)
    @Schema(description = "自行车道连通性(0-5)")
    private Double bikeLaneConnectivity;

    @Column(name = "urban_facilities_integrity", nullable = false)
    @Schema(description = "城市设施/家具完善度(0-5)")
    private Double urbanFacilitiesIntegrity;

    @Column(name = "urban_facilities_damage", nullable = false)
    @Schema(description = "城市设施/家具破损程度(0-5)")
    private Double urbanFacilitiesDamage;

    @Column(name = "other", nullable = false)
    @Schema(description = "其他(0-5)")
    private Double other;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id", insertable = false, updatable = false)
    private Photo photo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", insertable = false, updatable = false)
    private AIModel model;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPhotoId() {
        return photo != null ? photo.getId() : null;
    }

    public void setPhotoId(Long photoId) {
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public Double getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Double overallRating) {
        this.overallRating = overallRating;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public Double getShopSignBuilding() {
        return shopSignBuilding;
    }

    public void setShopSignBuilding(Double shopSignBuilding) {
        this.shopSignBuilding = shopSignBuilding;
    }

    public Double getGreeneryMaintenance() {
        return greeneryMaintenance;
    }

    public void setGreeneryMaintenance(Double greeneryMaintenance) {
        this.greeneryMaintenance = greeneryMaintenance;
    }

    public Double getGreeneryCoverage() {
        return greeneryCoverage;
    }

    public void setGreeneryCoverage(Double greeneryCoverage) {
        this.greeneryCoverage = greeneryCoverage;
    }

    public Double getSidewalkDamage() {
        return sidewalkDamage;
    }

    public void setSidewalkDamage(Double sidewalkDamage) {
        this.sidewalkDamage = sidewalkDamage;
    }

    public Double getBikeLaneConnectivity() {
        return bikeLaneConnectivity;
    }

    public void setBikeLaneConnectivity(Double bikeLaneConnectivity) {
        this.bikeLaneConnectivity = bikeLaneConnectivity;
    }

    public Double getUrbanFacilitiesIntegrity() {
        return urbanFacilitiesIntegrity;
    }

    public void setUrbanFacilitiesIntegrity(Double urbanFacilitiesIntegrity) {
        this.urbanFacilitiesIntegrity = urbanFacilitiesIntegrity;
    }

    public Double getUrbanFacilitiesDamage() {
        return urbanFacilitiesDamage;
    }

    public void setUrbanFacilitiesDamage(Double urbanFacilitiesDamage) {
        this.urbanFacilitiesDamage = urbanFacilitiesDamage;
    }

    public Double getOther() {
        return other;
    }

    public void setOther(Double other) {
        this.other = other;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Photo getPhoto() {
        return photo;
    }

    public void setPhoto(Photo photo) {
        this.photo = photo;
    }

    public AIModel getModel() {
        return model;
    }

    public void setModel(AIModel model) {
        this.model = model;
    }
}
