package com.urban.management.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 街道评分实体类
 */
@Entity
@Table(name = "street_scores")
@Schema(description = "街道评分实体")
public class StreetScore implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "评分ID")
    private Long id;

    @Column(name = "street_name", nullable = false, length = 100)
    @Schema(description = "街道名称")
    private String streetName;

    @Column(name = "district", nullable = false, length = 100)
    @Schema(description = "区域")
    private String district;

    @Column(name = "city", nullable = false, length = 100)
    @Schema(description = "城市")
    private String city;

    @Column(name = "score", nullable = false)
    @Schema(description = "综合评分")
    private Double score;

    @Column(name = "shop_sign_score")
    @Schema(description = "店招评分")
    private Double shopSignScore;

    @Column(name = "tree_score")
    @Schema(description = "行道树评分")
    private Double treeScore;

    @Column(name = "greening_score")
    @Schema(description = "绿化评分")
    private Double greeningScore;

    @Column(name = "sidewalk_score")
    @Schema(description = "人行道铺装评分")
    private Double sidewalkScore;

    @Column(name = "bicycle_lane_score")
    @Schema(description = "自行车道评分")
    private Double bicycleLaneScore;

    @Column(name = "evaluation_date", nullable = false)
    @Schema(description = "评估日期")
    private LocalDateTime evaluationDate;

    @Column(name = "total_photos")
    @Schema(description = "总照片数")
    private Integer totalPhotos;

    @Column(name = "maintenance_recommendation", length = 1000)
    @Schema(description = "维护建议")
    private String maintenanceRecommendation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStreetName() {
        return streetName;
    }

    public void setStreetName(String streetName) {
        this.streetName = streetName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Double getShopSignScore() {
        return shopSignScore;
    }

    public void setShopSignScore(Double shopSignScore) {
        this.shopSignScore = shopSignScore;
    }

    public Double getTreeScore() {
        return treeScore;
    }

    public void setTreeScore(Double treeScore) {
        this.treeScore = treeScore;
    }

    public Double getGreeningScore() {
        return greeningScore;
    }

    public void setGreeningScore(Double greeningScore) {
        this.greeningScore = greeningScore;
    }

    public Double getSidewalkScore() {
        return sidewalkScore;
    }

    public void setSidewalkScore(Double sidewalkScore) {
        this.sidewalkScore = sidewalkScore;
    }

    public Double getBicycleLaneScore() {
        return bicycleLaneScore;
    }

    public void setBicycleLaneScore(Double bicycleLaneScore) {
        this.bicycleLaneScore = bicycleLaneScore;
    }

    public LocalDateTime getEvaluationDate() {
        return evaluationDate;
    }

    public void setEvaluationDate(LocalDateTime evaluationDate) {
        this.evaluationDate = evaluationDate;
    }

    public Integer getTotalPhotos() {
        return totalPhotos;
    }

    public void setTotalPhotos(Integer totalPhotos) {
        this.totalPhotos = totalPhotos;
    }

    public String getMaintenanceRecommendation() {
        return maintenanceRecommendation;
    }

    public void setMaintenanceRecommendation(String maintenanceRecommendation) {
        this.maintenanceRecommendation = maintenanceRecommendation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
