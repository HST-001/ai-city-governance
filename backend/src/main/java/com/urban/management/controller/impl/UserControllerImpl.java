package com.urban.management.controller.impl;

import com.urban.management.controller.UserController;
import com.urban.management.dto.LoginRequest;
import com.urban.management.dto.RegisterRequest;
import com.urban.management.dto.UserDTO;
import com.urban.management.dto.UserUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户控制器实现类
 */
@RestController
public class UserControllerImpl implements UserController {

    @Override
    public ResponseEntity<Map<String, Object>> login(LoginRequest loginRequest) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Login successful");
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Object>> register(RegisterRequest registerRequest) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Register successful");
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Logout successful"));
    }

    @Override
    public ResponseEntity<UserDTO> getCurrentUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(1L);
        userDTO.setUsername("admin");
        return ResponseEntity.ok(userDTO);
    }

    @Override
    public ResponseEntity<UserDTO> updateCurrentUser(UserUpdateRequest updateRequest) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(1L);
        userDTO.setUsername("admin_updated");
        return ResponseEntity.ok(userDTO);
    }

    @Override
    public ResponseEntity<Map<String, String>> changePassword(UserController.ChangePasswordRequest request) {
        return ResponseEntity.ok(Collections.singletonMap("message", "Password changed successfully"));
    }

    @Override
    public ResponseEntity<Map<String, Object>> resetPassword(Long id) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Password reset successfully");
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<UserDTO> getUserById(Long id) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(id);
        userDTO.setUsername("user" + id);
        return ResponseEntity.ok(userDTO);
    }

    @Override
    public ResponseEntity<Page<UserDTO>> getUsers(Pageable pageable) {
        Page<UserDTO> page = Page.empty();
        return ResponseEntity.ok(page);
    }

    @Override
    public ResponseEntity<UserDTO> createUser(RegisterRequest request) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(100L);
        userDTO.setUsername("new_user");
        return ResponseEntity.ok(userDTO);
    }

    @Override
    public ResponseEntity<UserDTO> updateUser(Long id, UserUpdateRequest request) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(id);
        userDTO.setUsername("updated_user");
        return ResponseEntity.ok(userDTO);
    }

    @Override
    public ResponseEntity<Map<String, String>> deleteUser(Long id) {
        return ResponseEntity.ok(Collections.singletonMap("message", "User deleted successfully"));
    }

    @Override
    public ResponseEntity<UserDTO> updateUserStatus(Long id, Map<String, Boolean> request) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(id);
        userDTO.setUsername("user" + id);
        return ResponseEntity.ok(userDTO);
    }

    @Override
    public ResponseEntity<UserDTO> updateUserRoles(Long id, Map<String, List<String>> request) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(id);
        userDTO.setUsername("user" + id);
        return ResponseEntity.ok(userDTO);
    }
}