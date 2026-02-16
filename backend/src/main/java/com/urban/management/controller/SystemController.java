package com.urban.management.controller;

import com.urban.management.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 系统基础控制器
 */
@Tag(name = "系统基础接口", description = "系统健康检查、版本信息等基础接口")
@RestController
public class SystemController {

    /**
     * 系统健康检查接口
     */
    @Operation(summary = "健康检查", description = "检查系统是否正常运行")
    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> healthCheck() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("message", "系统运行正常");
        data.put("version", "1.0.0");
        
        return ApiResponse.success(data);
    }

    /**
     * 获取系统信息
     */
    @Operation(summary = "系统信息", description = "获取系统版本、名称等基本信息")
    @GetMapping("/system/info")
    public ApiResponse<Map<String, String>> getSystemInfo() {
        Map<String, String> data = new HashMap<>();
        data.put("name", "街道更新维护治理系统");
        data.put("version", "1.0.0");
        data.put("description", "基于AI视觉技术的城市街道治理评估系统");
        
        return ApiResponse.success(data);
    }
}
