package com.urban.management.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_datasets")
@Schema(description = "训练数据集实体")
public class TrainingDataset implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "数据集ID")
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    @Schema(description = "数据集名称")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    @Schema(description = "数据集描述")
    private String description;

    @Column(name = "file_count", nullable = false)
    @Schema(description = "文件数量")
    private Integer fileCount;

    @Column(name = "file_size", nullable = false, length = 50)
    @Schema(description = "文件大小")
    private String fileSize;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    @Schema(description = "上传时间")
    private LocalDateTime uploadedAt;

    @Column(name = "uploaded_by", nullable = false)
    @Schema(description = "上传用户ID")
    private Long uploadedBy;

    @Column(name = "status", nullable = false, length = 20)
    @Schema(description = "状态：available-可用, processing-处理中, deprecated-已废弃")
    private String status;

    @Column(name = "storage_path", length = 500)
    @Schema(description = "存储路径")
    private String storagePath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

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

    public Integer getFileCount() {
        return fileCount;
    }

    public void setFileCount(Integer fileCount) {
        this.fileCount = fileCount;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
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
