package com.urban.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_models")
@Schema(description = "AI模型实体")
public class AIModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "模型ID")
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    @Schema(description = "模型名称")
    private String name;

    @Column(name = "type", nullable = false, length = 50)
    @Schema(description = "模型类型")
    private String type;

    @Column(name = "description", columnDefinition = "TEXT")
    @Schema(description = "模型描述")
    private String description;

    @Column(name = "version", nullable = false, length = 50)
    @Schema(description = "版本号")
    private String version;

    @Column(name = "status", nullable = false, length = 20)
    @Schema(description = "状态：active-启用, inactive-停用")
    private String status;

    @Column(name = "accuracy", nullable = false)
    @Schema(description = "准确率")
    private Double accuracy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false)
    @Schema(description = "创建者用户ID")
    private Long createdBy;

    @Column(name = "training_data_size", length = 50)
    @Schema(description = "训练数据大小")
    private String trainingDataSize;

    @Column(name = "is_production", nullable = false)
    @Schema(description = "是否生产环境")
    private Boolean isProduction;

    @Column(name = "model_path", length = 500)
    @Schema(description = "模型文件存储路径")
    private String modelPath;

    @Column(name = "training_task_id")
    @Schema(description = "关联的训练任务ID")
    private Long trainingTaskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_task_id", insertable = false, updatable = false)
    private TrainingTask trainingTask;

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public String getTrainingDataSize() {
        return trainingDataSize;
    }

    public void setTrainingDataSize(String trainingDataSize) {
        this.trainingDataSize = trainingDataSize;
    }

    public Boolean getIsProduction() {
        return isProduction;
    }

    public void setIsProduction(Boolean isProduction) {
        this.isProduction = isProduction;
    }

    public String getModelPath() {
        return modelPath;
    }

    public void setModelPath(String modelPath) {
        this.modelPath = modelPath;
    }

    public Long getTrainingTaskId() {
        return trainingTask != null ? trainingTask.getId() : null;
    }

    public TrainingTask getTrainingTask() {
        return trainingTask;
    }

    public void setTrainingTask(TrainingTask trainingTask) {
        this.trainingTask = trainingTask;
    }
}
