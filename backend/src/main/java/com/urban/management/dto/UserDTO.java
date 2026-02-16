package com.urban.management.dto;

import com.urban.management.entity.User;
import java.io.Serializable;

/**
 * 用户DTO
 */
public class UserDTO implements Serializable {
    
    private Long id;
    
    private String username;
    
    private String email;
    
    private String phone;
    
    private String role;
    
    private Boolean enabled;
    
    private String createdAt; // 改为String类型以避免LocalDateTime转换问题
    
    private String updatedAt; // 改为String类型以避免LocalDateTime转换问题
    
    // 手动添加getter和setter方法
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Boolean getEnabled() {
        return enabled;
    }
    
    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    /**
     * 将User对象转换为UserDTO
     */
    public static UserDTO fromUser(User user) {
        if (user == null) {
            return null;
        }
        
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setEnabled(user.getEnabled());
        // 简化日期处理，直接调用toString()或返回空字符串
        if (user.getCreatedAt() != null) {
            dto.setCreatedAt(user.getCreatedAt().toString());
        }
        if (user.getUpdatedAt() != null) {
            dto.setUpdatedAt(user.getUpdatedAt().toString());
        }
        
        return dto;
    }
}