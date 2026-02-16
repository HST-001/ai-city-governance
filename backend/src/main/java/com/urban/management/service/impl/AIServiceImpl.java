package com.urban.management.service.impl;

import com.urban.management.entity.Photo;
import com.urban.management.service.AIService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * AI模型服务实现类
 * 当前版本使用模拟数据实现，后续可以替换为实际的AI模型
 */
@Service
public class AIServiceImpl implements AIService {

    // 城市元素类别
    private static final List<String> URBAN_ELEMENTS = Arrays.asList(
            "道路清洁度", "绿化覆盖", "建筑物外观", "公共设施", 
            "交通秩序", "环境卫生", "标识系统", "空气质量",
            "噪音水平", "行人舒适度"
    );

    @Override
    public Map<String, Object> scoreImage(MultipartFile file, String category) {
        validateFile(file);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 调用 Flask API 服务获取真实评分
            Map<String, Object> predictionResult = callFlaskApiPredict(file, category);
            result.putAll(predictionResult);
        } catch (Exception e) {
            // 预测失败，使用模拟数据
            System.err.println("AI 评分失败: " + e.getMessage());
            double overallScore = Math.round(ThreadLocalRandom.current().nextDouble(70, 100) * 10) / 10.0;
            result.put("overallScore", overallScore);
            result.put("dimensionScores", generateDimensionScores());
        }
        
        // 添加分析时间戳
        result.put("timestamp", new Date());
        
        // 添加文件信息
        result.put("fileName", file.getOriginalFilename());
        
        return result;
    }

    @Override
    public List<Map<String, Object>> batchScoreImages(List<MultipartFile> files) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                Map<String, Object> scoreResult = scoreImage(file, null);
                results.add(scoreResult);
            } catch (Exception e) {
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("fileName", file.getOriginalFilename());
                errorResult.put("error", e.getMessage());
                results.add(errorResult);
            }
        }
        
        return results;
    }

    @Override
    public List<Double> extractFeatures(MultipartFile file) {
        validateFile(file);
        
        // 模拟提取256维特征向量
        List<Double> features = new ArrayList<>(256);
        for (int i = 0; i < 256; i++) {
            features.add(ThreadLocalRandom.current().nextDouble(0, 1));
        }
        
        return features;
    }

    @Override
    public List<String> generateSuggestions(Photo photo) {
        List<String> suggestions = new ArrayList<>();
        
        // 模拟根据照片属性生成建议
        if (photo != null) {
            // 基于评分的建议生成逻辑
            double mockScore = ThreadLocalRandom.current().nextDouble(70, 95);
            
            if (mockScore < 80) {
                suggestions.add("建议加强该区域的环境卫生管理");
                suggestions.add("可考虑增加绿化覆盖率，提升城市美观度");
                suggestions.add("建议完善区域内的标识系统");
            } else if (mockScore < 90) {
                suggestions.add("该区域整体状况良好，可进一步优化公共设施维护");
                suggestions.add("建议加强垃圾分类宣传和管理");
            } else {
                suggestions.add("该区域环境质量优秀，建议作为示范区域推广相关经验");
                suggestions.add("可考虑增设休闲座椅等便民设施");
            }
            
            // 根据位置信息添加建议
            if (photo.getDistrict() != null && !photo.getDistrict().isEmpty()) {
                suggestions.add(String.format("建议在%s区域开展定期环境检查", photo.getDistrict()));
            }
        }
        
        return suggestions;
    }

    @Override
    public Map<String, Double> analyzeUrbanElements(MultipartFile file) {
        validateFile(file);
        
        Map<String, Double> elements = new HashMap<>();
        // 随机生成城市元素及其置信度
        for (String element : URBAN_ELEMENTS) {
            elements.put(element, Math.round(ThreadLocalRandom.current().nextDouble(0.1, 1.0) * 100) / 100.0);
        }
        
        return elements;
    }
    
    @Override
    public Map<String, Object> comparePhotos(MultipartFile file1, MultipartFile file2) {
        validateFile(file1);
        validateFile(file2);
        
        Map<String, Object> comparison = new HashMap<>();
        
        // 生成两张照片的模拟评分
        double score1 = Math.round(ThreadLocalRandom.current().nextDouble(70, 100) * 10) / 10.0;
        double score2 = Math.round(ThreadLocalRandom.current().nextDouble(70, 100) * 10) / 10.0;
        
        comparison.put("photo1Score", score1);
        comparison.put("photo2Score", score2);
        comparison.put("scoreDifference", Math.abs(Math.round((score1 - score2) * 10) / 10.0));
        
        // 模拟哪个照片更好
        if (score1 > score2) {
            comparison.put("betterPhoto", "photo1");
            comparison.put("reasons", Arrays.asList("整体环境质量更佳", "设施维护更到位"));
        } else if (score2 > score1) {
            comparison.put("betterPhoto", "photo2");
            comparison.put("reasons", Arrays.asList("绿化效果更好", "整洁度更高"));
        } else {
            comparison.put("betterPhoto", "equal");
            comparison.put("reasons", Arrays.asList("两张照片质量相当", "各有优势"));
        }
        
        return comparison;
    }

    @Override
    public Double getAestheticScore(MultipartFile file) {
        validateFile(file);
        
        // 生成70-100之间的美学评分，保留一位小数
        return Math.round(ThreadLocalRandom.current().nextDouble(70, 100) * 10) / 10.0;
    }

    @Override
    public Map<String, String> getModelInfo() {
        Map<String, String> modelInfo = new HashMap<>();
        modelInfo.put("modelName", "UrbanManagementAIModel");
        modelInfo.put("version", "1.1.0"); // 更新版本号
        modelInfo.put("type", "Enhanced Simulation Version");
        modelInfo.put("description", "城市环境评估AI模型 - 增强版，包含优化API调用");
        modelInfo.put("updateTime", "2024-01-01");
        modelInfo.put("supportedFunctions", "图像评分,特征提取,城市元素分析,建议生成");
        modelInfo.put("enhancements", "优化API调用,提高可靠性");
        
        return modelInfo;
    }

    /**
     * 生成各维度的评分
     */
    private Map<String, Double> generateDimensionScores() {
        Map<String, Double> scores = new HashMap<>();
        
        // 定义新的评分维度（与Flask API保持一致）
        List<String> dimensions = Arrays.asList(
                "store_sign", "greenery", "sidewalk", "bike_lane", "urban_facilities"
        );
        
        // 为每个维度生成1-5之间的随机分数（与Flask API保持一致）
        for (String dimension : dimensions) {
            double score = Math.round(ThreadLocalRandom.current().nextDouble(2, 5) * 10) / 10.0;
            scores.put(dimension, score);
        }
        
        return scores;
    }

    /**
     * 验证文件是否有效
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        // 检查文件大小 (限制为10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("文件大小不能超过10MB");
        }
        
        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedImageType(contentType)) {
            throw new IllegalArgumentException("仅支持JPG、JPEG、PNG和WEBP格式的图片文件");
        }
    }

    /**
     * 检查是否为允许的图片类型
     */
    private boolean isAllowedImageType(String contentType) {
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/jpg", "image/png", "image/webp"
        );
        return allowedTypes.contains(contentType.toLowerCase());
    }

    /**
     * 调用 Flask API 服务获取真实评分
     */
    private Map<String, Object> callFlaskApiPredict(MultipartFile file, String category) throws Exception {
        // 构建 API 请求
        String apiUrl = "http://localhost:5000/predict";
        System.out.println("Calling Flask API: " + apiUrl);
        
        // 使用 Apache HttpClient 发送 multipart/form-data 请求
        org.apache.http.client.HttpClient client = org.apache.http.impl.client.HttpClients.createDefault();
        org.apache.http.client.methods.HttpPost post = new org.apache.http.client.methods.HttpPost(apiUrl);
        
        // 创建 multipart 实体
        org.apache.http.entity.mime.MultipartEntityBuilder builder = org.apache.http.entity.mime.MultipartEntityBuilder.create();
        builder.setMode(org.apache.http.entity.mime.HttpMultipartMode.BROWSER_COMPATIBLE);
        builder.addBinaryBody("file", file.getBytes(), org.apache.http.entity.ContentType.create(file.getContentType()), file.getOriginalFilename());
        
        // 设置请求实体
        org.apache.http.HttpEntity entity = builder.build();
        post.setEntity(entity);
        
        // 重试机制，最多重试3次
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                // 发送请求
                org.apache.http.HttpResponse response = client.execute(post);
                
                // 检查响应状态
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode != 200) {
                    System.err.println("Flask API 调用失败，状态码: " + statusCode);
                    
                    // 读取错误信息
                    try (java.io.BufferedReader reader = new java.io.BufferedReader(
                            new java.io.InputStreamReader(response.getEntity().getContent()))) {
                        StringBuilder errorBuilder = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            errorBuilder.append(line);
                        }
                        System.err.println("错误信息: " + errorBuilder.toString());
                    }
                    
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        throw new Exception("Flask API 调用失败，已达到最大重试次数");
                    }
                    System.out.println("重试调用 Flask API (" + retryCount + "/" + maxRetries + ")");
                    Thread.sleep(1000); // 重试前等待1秒
                    continue;
                }
                
                // 解析 JSON 响应
                String responseBody;
                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(response.getEntity().getContent()))) {
                    StringBuilder builder1 = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        builder1.append(line);
                    }
                    responseBody = builder1.toString();
                }
                
                System.out.println("Flask API 响应: " + responseBody);
                
                // 使用 Jackson 解析 JSON
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<String, Object> apiResponse = mapper.readValue(responseBody, java.util.Map.class);
                
                // 处理 API 响应
                if ("success".equals(apiResponse.get("status"))) {
                    java.util.Map<String, Object> data = (java.util.Map<String, Object>) apiResponse.get("data");
                    
                    // 转换评分数据
                    double overallScore = ((Number) data.get("overall_score")).doubleValue();
                    java.util.Map<String, Object> categories = (java.util.Map<String, Object>) data.get("categories");
                    java.util.Map<String, Object> subdimensions = (java.util.Map<String, Object>) data.getOrDefault("subdimensions", new java.util.HashMap<>());
                    
                    // 构建结果
                    java.util.Map<String, Object> result = new java.util.HashMap<>();
                    result.put("overallScore", overallScore);
                    result.put("overallLevel", data.get("overall_level"));
                    result.put("dimensionScores", categories);
                    result.put("subdimensionScores", subdimensions);
                    result.put("suggestions", data.get("suggestions"));
                    result.put("isMockData", data.getOrDefault("is_mock_data", false));
                    result.put("isStreetScene", true);
                    
                    return result;
                } else {
                    // 检查是否为非街道场景错误
                    String message = (String) apiResponse.get("message");
                    System.out.println("Flask API 返回: " + message);
                    
                    // 如果是非街道场景，直接返回错误信息，不重试
                    if (message != null && message.contains("非街道场景")) {
                        java.util.Map<String, Object> result = new java.util.HashMap<>();
                        result.put("overallScore", 0.0);
                        result.put("error", message);
                        result.put("isStreetScene", false);
                        result.put("isMockData", false);
                        return result;
                    }
                    
                    // 其他错误才重试
                    System.err.println("Flask API 返回错误: " + message);
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        throw new Exception("Flask API 返回错误: " + message);
                    }
                    System.out.println("重试调用 Flask API (" + retryCount + "/" + maxRetries + ")");
                    Thread.sleep(1000); // 重试前等待1秒
                    continue;
                }
            } catch (Exception e) {
                System.err.println("Flask API 调用异常: " + e.getMessage());
                e.printStackTrace();
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw e;
                }
                System.out.println("重试调用 Flask API (" + retryCount + "/" + maxRetries + ")");
                Thread.sleep(1000); // 重试前等待1秒
            }
        }
        
        // 所有重试都失败
        throw new Exception("Flask API 调用失败，已达到最大重试次数");
    }
}


