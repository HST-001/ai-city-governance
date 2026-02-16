import { User } from '../types/user';
import { Permission, rolePermissions } from '../types/rolePermissions';

/**
 * 检查用户是否具有指定权限
 * @param user 当前登录用户
 * @param permission 需要检查的权限
 * @returns 用户是否具有该权限
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  // 如果用户未登录，直接返回false
  if (!user) {
    return false;
  }
  
  // 获取用户角色对应的权限列表
  const userPermissions = rolePermissions[user.role] || [];
  
  // 检查是否包含指定权限
  return userPermissions.includes(permission);
};

/**
 * 检查用户是否有多个权限中的任意一个
 * @param user 当前登录用户
 * @param permissions 需要检查的权限列表
 * @returns 用户是否至少具有其中一个权限
 */
export const hasAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
  if (!user) {
    return false;
  }
  
  const userPermissions = rolePermissions[user.role] || [];
  
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * 检查用户是否具有所有指定的权限
 * @param user 当前登录用户
 * @param permissions 需要检查的权限列表
 * @returns 用户是否具有所有指定权限
 */
export const hasAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
  if (!user) {
    return false;
  }
  
  const userPermissions = rolePermissions[user.role] || [];
  
  return permissions.every(permission => userPermissions.includes(permission));
};
