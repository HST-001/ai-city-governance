package com.urban.management.service;

import com.urban.management.dto.request.RatingRequest;
import java.util.List;
import java.util.Map;

/**
 * 评分服务接口
 */
public interface RatingService {

    /**
     * 获取评分配置
     */
    Map<String, Object> getRatingConfig();

    /**
     * 对照片进行评分
     */
    Map<String, Object> ratePhoto(Long photoId, RatingRequest request);

    /**
     * 批量评分照片
     */
    Map<Long, Map<String, Object>> batchRatePhotos(Map<String, Object> requestBody);

    /**
     * 获取照片的评分历史
     */
    List<Map<String, Object>> getPhotoRatingHistory(Long photoId);

    /**
     * 比较两张照片的评分
     */
    Map<String, Object> comparePhotos(Long photoId1, Long photoId2, List<String> dimensions);

    /**
     * 获取评分统计数据
     */
    Map<String, Object> getRatingStatistics(List<Long> photoIds);
}