package com.urban.management.service;

import com.urban.management.entity.Photo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * AI模型服务接口
 * 提供图像分析、评分和建议生成等AI功能
 */
public interface AIService {

    /**
     * 对图像进行评分
     * @param file 待评分的图像文件
     * @param category 图像类别（可选）
     * @return 评分结果，包含总体得分和各维度评分
     */
    Map<String, Object> scoreImage(MultipartFile file, String category);

    /**
     * 批量评分照片
     * @param files 待评分的图像文件列表
     * @return 包含多张照片评分结果的Map列表
     */
    List<Map<String, Object>> batchScoreImages(List<MultipartFile> files);

    /**
     * 提取图像特征
     * @param file 待分析的图像文件
     * @return 提取的图像特征向量
     */
    List<Double> extractFeatures(MultipartFile file);

    /**
     * 根据照片评分生成改进建议
     * @param photo 照片对象
     * @return 改进建议列表
     */
    List<String> generateSuggestions(Photo photo);

    /**
     * 分析照片中的城市元素
     * @param file 待分析的图像文件
     * @return 检测到的城市元素及其置信度
     */
    Map<String, Double> analyzeUrbanElements(MultipartFile file);

    /**
     * 比较两张照片的质量差异
     * @param file1 第一张照片
     * @param file2 第二张照片
     * @return 差异分析结果
     */
    Map<String, Object> comparePhotos(MultipartFile file1, MultipartFile file2);

    /**
     * 获取照片的美学评分
     * @param file 待评分的图像文件
     * @return 美学评分(0-100)
     */
    Double getAestheticScore(MultipartFile file);

    /**
     * 获取模型版本信息
     * @return 模型版本和性能信息
     */
    Map<String, String> getModelInfo();
}
