package com.urban.management.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户更新请求DTO
 */
@Data
@Schema(description = "用户更新请求")
public class UserUpdateRequest {

    @Size(min = 4, max = 50, message = "用户名长度必须在4-50个字符之间")
    @Schema(description = "用户名", example = "updateduser")
    private String username;

    @Email(message = "邮箱格式不正确")
    @Schema(description = "邮箱", example = "updated@example.com")
    private String email;

    @Schema(description = "手机号码", example = "13900139000")
    private String phone;

    @Schema(description = "角色")
    private String role;

    @Schema(description = "是否启用")
    private Boolean enabled;
}
