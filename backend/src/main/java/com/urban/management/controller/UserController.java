package com.urban.management.controller;

import com.urban.management.dto.LoginRequest;
import com.urban.management.dto.RegisterRequest;
import com.urban.management.dto.UserDTO;
import com.urban.management.dto.UserUpdateRequest;
import com.urban.management.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户控制器接口
 */
@Tag(name = "用户管理", description = "用户登录、注册、信息管理等接口")
@RequestMapping("/users")
public interface UserController {

    /**
     * 用户登录
     */
    @Operation(summary = "用户登录", description = "用户登录接口，返回token和用户信息")
    @PostMapping("/login")
    ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest);

    /**
     * 用户注册
     */
    @Operation(summary = "用户注册", description = "用户注册接口")
    @PostMapping("/register")
    ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest registerRequest);

    /**
     * 用户登出
     */
    @Operation(summary = "用户登出", description = "用户登出接口")
    @PostMapping("/logout")
    ResponseEntity<Map<String, String>> logout();

    /**
     * 获取当前登录用户信息
     */
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息")
    @GetMapping("/current")
    ResponseEntity<UserDTO> getCurrentUser();

    /**
     * 更新用户信息
     */
    @Operation(summary = "更新用户信息", description = "更新当前用户的基本信息")
    @PutMapping("/current")
    ResponseEntity<UserDTO> updateCurrentUser(@RequestBody UserUpdateRequest updateRequest);

    /**
     * 修改密码
     */
    @Operation(summary = "修改密码", description = "修改用户密码")
    @PostMapping("/change-password")
    ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest request);

    /**
     * 重置密码
     */
    @Operation(summary = "重置密码", description = "管理员重置用户密码")
    @PostMapping("/{id}/reset-password")
    ResponseEntity<Map<String, Object>> resetPassword(@PathVariable("id") Long id);

    /**
     * 根据ID获取用户信息
     */
    @Operation(summary = "获取用户信息", description = "根据用户ID获取用户详细信息")
    @GetMapping("/{id}")
    ResponseEntity<UserDTO> getUserById(@PathVariable("id") Long id);

    /**
     * 获取用户列表
     */
    @Operation(summary = "获取用户列表", description = "获取用户列表，支持分页和筛选")
    @GetMapping
    ResponseEntity<Page<UserDTO>> getUsers(Pageable pageable);

    /**
     * 创建用户（管理员）
     */
    @Operation(summary = "创建用户", description = "管理员创建新用户")
    @PostMapping
    ResponseEntity<UserDTO> createUser(@RequestBody RegisterRequest request);

    /**
     * 更新用户信息（管理员）
     */
    @Operation(summary = "更新用户信息", description = "管理员更新用户信息")
    @PutMapping("/{id}")
    ResponseEntity<UserDTO> updateUser(@PathVariable("id") Long id, @RequestBody UserUpdateRequest request);

    /**
     * 删除用户（管理员）
     */
    @Operation(summary = "删除用户", description = "管理员删除用户")
    @DeleteMapping("/{id}")
    ResponseEntity<Map<String, String>> deleteUser(@PathVariable("id") Long id);

    /**
     * 禁用/启用用户（管理员）
     */
    @Operation(summary = "禁用/启用用户", description = "管理员禁用或启用用户账号")
    @PutMapping("/{id}/status")
    ResponseEntity<UserDTO> updateUserStatus(@PathVariable("id") Long id, @RequestBody Map<String, Boolean> request);

    /**
     * 修改用户角色（管理员）
     */
    @Operation(summary = "修改用户角色", description = "管理员修改用户角色权限")
    @PutMapping("/{id}/roles")
    ResponseEntity<UserDTO> updateUserRoles(@PathVariable("id") Long id, @RequestBody Map<String, List<String>> request);

    /**
     * 密码修改请求参数类
     */
    class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;

        // getter and setter
        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}