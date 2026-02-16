package com.urban.management.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "创建AI模型请求")
public class CreateModelRequest {
    @Schema(description = "模型名称")
    private String name;

    @Schema(description = "模型类型")
    private String type;

    @Schema(description = "模型描述")
    private String description;

    @Schema(description = "版本号")
    private String version;

    @Schema(description = "创建用户ID")
    private Long createdBy;

    @Schema(description = "训练任务ID")
    private Long trainingTaskId;

    @Schema(description = "模型路径")
    private String modelPath;

    @Schema(description = "训练数据大小")
    private String trainingDataSize;

    @Schema(description = "准确率")
    private Double accuracy;

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

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getTrainingTaskId() {
        return trainingTaskId;
    }

    public void setTrainingTaskId(Long trainingTaskId) {
        this.trainingTaskId = trainingTaskId;
    }

    public String getModelPath() {
        return modelPath;
    }

    public void setModelPath(String modelPath) {
        this.modelPath = modelPath;
    }

    public String getTrainingDataSize() {
        return trainingDataSize;
    }

    public void setTrainingDataSize(String trainingDataSize) {
        this.trainingDataSize = trainingDataSize;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }
}
