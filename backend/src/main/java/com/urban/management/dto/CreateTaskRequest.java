package com.urban.management.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "创建训练任务请求")
public class CreateTaskRequest {
    @Schema(description = "任务名称")
    private String name;

    @Schema(description = "任务描述")
    private String description;

    @Schema(description = "模型类型")
    private String modelType;

    @Schema(description = "训练用户ID")
    private Long trainedBy;

    @Schema(description = "数据集ID")
    private Long datasetId;

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
}
