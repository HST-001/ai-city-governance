package com.urban.management.repository;

import com.urban.management.entity.AnalysisResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * AI分析结果数据访问接口
 */
@Repository
public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {

    /**
     * 根据照片ID查找分析结果
     *
     * @param photoId 照片ID
     * @return Optional<AnalysisResult>
     */
    Optional<AnalysisResult> findByPhotoId(Long photoId);

    /**
     * 根据设施类型查找分析结果，分页返回
     *
     * @param facilityType 设施类型
     * @param pageable 分页参数
     * @return Page<AnalysisResult>
     */
    Page<AnalysisResult> findByFacilityType(String facilityType, Pageable pageable);

    /**
     * 根据严重程度查找分析结果，分页返回
     *
     * @param severity 严重程度
     * @param pageable 分页参数
     * @return Page<AnalysisResult>
     */
    Page<AnalysisResult> findBySeverity(String severity, Pageable pageable);

    /**
     * 根据置信度分数范围查找分析结果
     *
     * @param minConfidence 最小置信度
     * @param maxConfidence 最大置信度
     * @param pageable 分页参数
     * @return Page<AnalysisResult>
     */
    Page<AnalysisResult> findByConfidenceScoreBetween(Double minConfidence, Double maxConfidence, Pageable pageable);

    /**
     * 根据用户ID查找该用户上传照片的分析结果
     *
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return Page<AnalysisResult>
     */
    @Query("SELECT ar FROM AnalysisResult ar WHERE ar.photo.uploadedBy = :userId")
    Page<AnalysisResult> findByPhotoUploadedBy(@Param("userId") Long userId, Pageable pageable);

    /**
     * 删除指定照片ID的分析结果
     *
     * @param photoId 照片ID
     */
    void deleteByPhotoId(Long photoId);
}

