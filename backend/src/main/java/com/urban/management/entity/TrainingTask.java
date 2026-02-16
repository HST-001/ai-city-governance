package com.urban.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_tasks")
@Schema(description = "训练任务实体")
public class TrainingTask implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "任务ID")
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    @Schema(description = "任务名称")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    @Schema(description = "任务描述")
    private String description;

    @Column(name = "model_type", nullable = false, length = 50)
    @Schema(description = "模型类型")
    private String modelType;

    @Column(name = "regression_head", length = 20)
    @Schema(description = "回归头类型：none-不使用, basic-基础, advanced-高级, ensemble-集成")
    private String regressionHead;

    @Column(name = "status", nullable = false, length = 20)
    @Schema(description = "状态：pending-待开始, training-训练中, completed-已完成, failed-失败")
    private String status;

    @Column(name = "progress", nullable = false)
    @Schema(description = "训练进度(0-100)")
    private Integer progress;

    @Column(name = "photo_count", nullable = false)
    @Schema(description = "训练照片数量")
    private Integer photoCount;

    @Column(name = "accuracy", nullable = false)
    @Schema(description = "准确率")
    private Double accuracy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    @Schema(description = "完成时间")
    private LocalDateTime completedAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    @Column(name = "trained_by", nullable = false)
    @Schema(description = "训练者用户ID")
    private Long trainedBy;

    @Column(name = "model_path", length = 500)
    @Schema(description = "模型文件存储路径")
    private String modelPath;

    @Column(name = "dataset_id")
    @Schema(description = "数据集ID")
    private Long datasetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id", insertable = false, updatable = false)
    @JsonIgnore
    private TrainingDataset dataset;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getRegressionHead() {
        return regressionHead;
    }

    public void setRegressionHead(String regressionHead) {
        this.regressionHead = regressionHead;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Integer getPhotoCount() {
        return photoCount;
    }

    public void setPhotoCount(Integer photoCount) {
        this.photoCount = photoCount;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getTrainedBy() {
        return trainedBy;
    }

    public void setTrainedBy(Long trainedBy) {
        this.trainedBy = trainedBy;
    }

    public Long getDatasetId() {
        return datasetId;
    }

    public void setDatasetId(Long datasetId) {
        this.datasetId = datasetId;
    }

    public String getModelPath() {
        return modelPath;
    }

    public void setModelPath(String modelPath) {
        this.modelPath = modelPath;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public TrainingDataset getDataset() {
        return dataset;
    }

    public void setDataset(TrainingDataset dataset) {
        this.dataset = dataset;
    }
}
