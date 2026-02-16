import { Role } from './rolePermissions';

/**
 * 用户类型定义
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: Role; // 修改为Role枚举类型
  enabled?: boolean;
  permissions: string[];
  avatarUrl?: string;
}

/**
 * 注册请求类型
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * 登录请求类型
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 更新用户资料请求类型
 */
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: string;
}

/**
 * 通用响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
