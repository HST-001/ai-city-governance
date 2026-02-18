import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { Permission, Role, rolePermissions } from '../types/rolePermissions';

// 定义usePermission Hook类型
export const usePermission = () => {
  const { user } = useAuth();

  // 使用useMemo缓存权限检查结果，避免不必要的重复计算
  const permissions = useMemo(() => {
    // 检查单个权限
    const can = (permission: Permission): boolean => {
      if (!user) return false;
      
      // 从rolePermissions中获取用户角色对应的权限列表
      const userPermissions = rolePermissions[user.role] || [];
      return userPermissions.includes(permission);
    };

    // 检查多个权限中是否至少有一个
    const canAny = (...permissionsToCheck: Permission[]): boolean => {
      return permissionsToCheck.some(permission => can(permission));
    };

    // 检查是否拥有所有指定权限
    const canAll = (...permissionsToCheck: Permission[]): boolean => {
      return permissionsToCheck.every(permission => can(permission));
    };

    // 获取用户角色
    const getUserRole = (): Role | null => {
      return user?.role || null;
    };
    
    /**
     * 检查用户是否拥有指定角色
     */
    const hasRole = (role: Role): boolean => {
      return user?.role === role;
    };
    
    /**
     * 检查用户是否可以训练模型
     * 只有管理员可以训练模型
     */
    const canTrainModels = (): boolean => {
      return hasRole(Role.ADMIN);
    };
    
    /**
     * 检查用户是否可以配置模型
     * 只有管理员可以配置模型
     */
    const canConfigureModels = (): boolean => {
      return hasRole(Role.ADMIN);
    };
    
    /**
     * 检查用户是否可以管理系统
     */
    const canManageSystem = (): boolean => {
      return hasRole(Role.ADMIN);
    };
    
    /**
     * 检查用户是否可以管理街道信息
     */
    const canManageStreets = (): boolean => {
      return hasRole(Role.ADMIN);
    };
    
    /**
     * 检查用户是否可以上传图片
     */
    const canUploadPhotos = (): boolean => {
      return hasRole(Role.ADMIN) || hasRole(Role.CLIENT);
    };
    
    /**
     * 检查用户是否可以删除图片
     */
    const canDeletePhotos = (): boolean => {
      return hasRole(Role.ADMIN);
    };
    
    /**
     * 检查用户是否可以对图片进行评分
     */
    const canRatePhotos = (): boolean => {
      return hasRole(Role.ADMIN) || hasRole(Role.CLIENT);
    };
    
    /**
     * 获取用户权限描述
     */
    const getUserPermissionDescription = (): string => {
      switch (user?.role) {
        case Role.ADMIN:
          return '管理员：拥有系统的所有权限，包括管理用户、训练模型、配置系统等。';
        case Role.CLIENT:
          return '客户端用户：可以上传照片、查看评分历史、使用AI评分功能等基础功能。';
        default:
          return '未知权限：请联系系统管理员。';
      }
    };
    
    /**
     * 检查用户是否可以访问指定页面
     */
    const canAccessPage = (requiredRoles?: Role[], requiredPermission?: Permission): boolean => {
      // 如果指定了必需角色，则检查用户是否拥有其中一个角色
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = user?.role;
        return userRole ? requiredRoles.includes(userRole) : false;
      }
      
      // 如果指定了必需权限，则检查用户是否拥有该权限
      if (requiredPermission) {
        return can(requiredPermission);
      }
      
      // 默认允许访问
      return true;
    };
    
    /**
     * 根据用户权限过滤菜单项
     */
    const filterMenuByPermission = <T extends { permission?: Permission; requiredRoles?: Role[] }>(items: T[]): T[] => {
      return items.filter(item => {
        // 如果菜单项指定了必需角色，则检查用户是否拥有其中一个角色
        if (item.requiredRoles && item.requiredRoles.length > 0) {
          const userRole = user?.role;
          return userRole ? item.requiredRoles.includes(userRole) : false;
        }
        
        // 如果菜单项指定了必需权限，则检查用户是否拥有该权限
        if (item.permission) {
          return can(item.permission);
        }
        
        // 默认允许访问
        return true;
      });
    };

    return {
      can,
      canAny,
      canAll,
      getUserRole,
      hasRole,
      canTrainModels,
      canConfigureModels,
      canManageSystem,
      canManageStreets,
      canUploadPhotos,
      canDeletePhotos,
      canRatePhotos,
      getUserPermissionDescription,
      canAccessPage,
      filterMenuByPermission,
      // 方便使用的快捷属性
      isAdmin: hasRole(Role.ADMIN),
      isDeveloper: false,
      isClient: hasRole(Role.CLIENT),
      user // 暴露user信息给外部使用
    };
  }, [user]);

  return permissions;
};