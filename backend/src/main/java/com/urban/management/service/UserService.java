package com.urban.management.service;

import com.urban.management.entity.User;
import com.urban.management.dto.LoginRequest;
import com.urban.management.dto.RegisterRequest;
import com.urban.management.dto.UserDTO;
import com.urban.management.dto.UserUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 用户登录
     * @param loginRequest 登录请求
     * @return JWT token和用户信息
     */
    String login(LoginRequest loginRequest);

    /**
     * 用户注册
     * @param registerRequest 注册请求
     * @return 注册后的用户信息
     */
    User register(RegisterRequest registerRequest);

    /**
     * 根据用户名查找用户
     * @param username 用户名
     * @return 用户信息
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     * @param email 邮箱
     * @return 用户信息
     */
    Optional<User> findByEmail(String email);

    /**
     * 根据ID查找用户
     * @param id 用户ID
     * @return 用户信息
     */
    Optional<User> findById(Long id);

    /**
     * 获取所有用户列表（分页）
     * @param pageable 分页参数
     * @return 分页用户列表
     */
    Page<User> findAll(Pageable pageable);

    /**
     * 更新用户信息
     * @param id 用户ID
     * @param userUpdateRequest 更新请求
     * @return 更新后的用户信息
     */
    User updateUser(Long id, UserUpdateRequest userUpdateRequest);

    /**
     * 删除用户
     * @param id 用户ID
     */
    void deleteUser(Long id);

    /**
     * 修改用户密码
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 重置用户密码
     * @param userId 用户ID
     * @return 新密码
     */
    String resetPassword(Long userId);

    /**
     * 启用/禁用用户
     * @param userId 用户ID
     * @param enabled 是否启用
     */
    void setUserEnabled(Long userId, boolean enabled);

    /**
     * 更新用户角色
     * @param userId 用户ID
     * @param role 新角色
     */
    void updateUserRole(Long userId, String role);

    /**
     * 用户注销（登出）
     * @param token JWT token
     */
    void logout(String token);

    /**
     * 刷新JWT token
     * @param oldToken 旧token
     * @return 新token
     */
    String refreshToken(String oldToken);
}
