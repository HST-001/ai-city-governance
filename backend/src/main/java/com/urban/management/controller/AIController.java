package com.urban.management.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * AI模型控制器接口
 * 提供图像分析、评分和建议生成等AI功能API
 */
@Tag(name = "AI模型服务", description = "城市环境图像分析、评分建议生成")
@RequestMapping("/ai")
public interface AIController {

    /**
     * 对单张照片进行评分
     */
    @Operation(summary = "单张图像评分", description = "对上传的图像进行评分，返回总体得分和各维度评分")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "评分成功", 
                    content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "400", description = "参数错误，如文件格式不支持")
    })
    @PostMapping("/score")
    ResponseEntity<Map<String, Object>> scoreImage(
            @Parameter(description = "待评分的图像文件", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "图像类别", required = false)
            @RequestParam(value = "category", required = false) String category);

    /**
     * 批量评分照片
     */
    @Operation(summary = "批量图像评分", description = "对多张图像进行批量评分，提高处理效率")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "批量评分成功", 
                    content = @Content(schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "400", description = "参数错误，如文件格式不支持")
    })
    @PostMapping("/batch-score")
    ResponseEntity<List<Map<String, Object>>> batchScoreImages(
            @Parameter(description = "待评分的图像文件列表", required = true)
            @RequestParam("files") List<MultipartFile> files);

    /**
     * 提取图像特征
     */
    @Operation(summary = "提取图像特征", description = "提取图像的特征向量，用于后续分析和比较")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "特征提取成功", 
                    content = @Content(schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "400", description = "参数错误")
    })
    @PostMapping("/extract-features")
    ResponseEntity<List<Double>> extractFeatures(
            @Parameter(description = "待分析的图像文件", required = true)
            @RequestParam("file") MultipartFile file);

    /**
     * 根据照片ID生成改进建议
     */
    @Operation(summary = "生成改进建议", description = "根据照片分析结果生成城市环境改进建议")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "建议生成成功", 
                    content = @Content(schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "404", description = "照片不存在")
    })
    @GetMapping("/suggestions/{photoId}")
    ResponseEntity<List<String>> generateSuggestions(
            @Parameter(description = "照片ID", required = true)
            @PathVariable("photoId") Long photoId);

    /**
     * 分析图像中的城市元素
     */
    @Operation(summary = "分析城市元素", description = "分析图像中包含的城市元素及其置信度")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "元素分析成功", 
                    content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "400", description = "参数错误")
    })
    @PostMapping("/analyze-elements")
    ResponseEntity<Map<String, Double>> analyzeUrbanElements(
            @Parameter(description = "待分析的图像文件", required = true)
            @RequestParam("file") MultipartFile file);

    /**
     * 比较两张照片
     */
    @Operation(summary = "比较两张照片", description = "比较两张照片的质量差异，提供对比分析")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "比较分析成功", 
                    content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "400", description = "参数错误")
    })
    @PostMapping("/compare-photos")
    ResponseEntity<Map<String, Object>> comparePhotos(
            @Parameter(description = "第一张照片", required = true)
            @RequestParam("file1") MultipartFile file1,
            @Parameter(description = "第二张照片", required = true)
            @RequestParam("file2") MultipartFile file2);

    /**
     * 获取图像美学评分
     */
    @Operation(summary = "图像美学评分", description = "评估图像的美学质量")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "评分成功", 
                    content = @Content(schema = @Schema(implementation = Double.class))),
            @ApiResponse(responseCode = "400", description = "参数错误")
    })
    @PostMapping("/aesthetic-score")
    ResponseEntity<Double> getAestheticScore(
            @Parameter(description = "待评分的图像文件", required = true)
            @RequestParam("file") MultipartFile file);

    /**
     * 获取模型信息
     */
    @Operation(summary = "获取AI模型信息", description = "获取当前AI模型的版本和支持功能等信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功", 
                    content = @Content(schema = @Schema(implementation = Map.class)))
    })
    @GetMapping("/model-info")
    ResponseEntity<Map<String, String>> getModelInfo();
}

