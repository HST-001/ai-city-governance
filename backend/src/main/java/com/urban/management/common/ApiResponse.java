package com.urban.management.common;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * API通用响应对象
 * @param <T> 响应数据类型
 */
@Schema(description = "通用API响应对象")
public class ApiResponse<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "状态码：200表示成功，非200表示失败")
    private int code;

    @Schema(description = "响应信息")
    private String message;

    @Schema(description = "响应数据")
    private T data;

    public ApiResponse() {
    }

    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 创建成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<T>(200, "success", data);
    }

    /**
     * 创建成功响应，无数据
     */
    public static ApiResponse<Map<String, Object>> success() {
        return new ApiResponse<Map<String, Object>>(200, "success", new HashMap<>());
    }

    /**
     * 创建失败响应
     */
    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<T>(code, message, null);
    }

    /**
     * 创建失败响应，带数据
     */
    public static <T> ApiResponse<T> fail(int code, String message, T data) {
        return new ApiResponse<T>(code, message, data);
    }

    // Getters and Setters
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
