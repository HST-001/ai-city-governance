package com.urban.management.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.Type;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 照片实体类
 */
@Entity
@Table(name = "photos")
@Schema(description = "照片实体")
public class Photo implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "照片ID")
    private Long id;

    @Column(name = "file_name", nullable = false, length = 255)
    @Schema(description = "文件名")
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 255)
    @Schema(description = "文件路径")
    private String filePath;

    @Column(name = "file_size", nullable = false)
    @Schema(description = "文件大小（字节）")
    private Long fileSize;

    @Column(name = "file_type", length = 50)
    @Schema(description = "文件类型")
    private String fileType;

    @Column(name = "latitude")
    @Schema(description = "纬度")
    private Double latitude;

    @Column(name = "longitude")
    @Schema(description = "经度")
    private Double longitude;

    @Column(name = "location_description", length = 255)
    @Schema(description = "位置描述")
    private String locationDescription;

    @Column(name = "street_name", length = 100)
    @Schema(description = "街道名称")
    private String streetName;

    @Column(name = "district", length = 100)
    @Schema(description = "区域")
    private String district;

    @Column(name = "province", length = 100)
    @Schema(description = "省份")
    private String province;

    @Column(name = "city", length = 100)
    @Schema(description = "城市")
    private String city;

    @Column(name = "photo_type", length = 50)
    @Schema(description = "照片类型（店招、行道树、绿化等）")
    private String photoType;

    @Column(name = "analyzed", nullable = false)
    @Schema(description = "是否已分析")
    private Boolean analyzed = false;

    @Column(name = "uploaded_by", nullable = false)
    @Schema(description = "上传用户ID")
    private Long uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    @Schema(description = "上传时间")
    private LocalDateTime uploadedAt;

    @Column(name = "last_analyzed_at")
    @Schema(description = "最后分析时间")
    private LocalDateTime lastAnalyzedAt;

    @Column(name = "rating")
    @Schema(description = "AI评分结果")
    private Double rating;

    @Column(name = "dimension_scores", columnDefinition = "jsonb")
    @Type(JsonBinaryType.class)
    @Schema(description = "多维度评分结果")
    private JsonNode dimensionScores;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getLocationDescription() {
        return locationDescription;
    }

    public void setLocationDescription(String locationDescription) {
        this.locationDescription = locationDescription;
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

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPhotoType() {
        return photoType;
    }

    public void setPhotoType(String photoType) {
        this.photoType = photoType;
    }

    public Boolean getAnalyzed() {
        return analyzed;
    }

    public void setAnalyzed(Boolean analyzed) {
        this.analyzed = analyzed;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDateTime getLastAnalyzedAt() {
        return lastAnalyzedAt;
    }

    public void setLastAnalyzedAt(LocalDateTime lastAnalyzedAt) {
        this.lastAnalyzedAt = lastAnalyzedAt;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public JsonNode getDimensionScores() {
        return dimensionScores;
    }

    public void setDimensionScores(JsonNode dimensionScores) {
        this.dimensionScores = dimensionScores;
    }
}
