// 定义角色枚举
export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

// 定义权限枚举
export enum Permission {
  // 基础权限
  AUTHENTICATED = 'AUTHENTICATED',
  ACCESS_PROFILE = 'ACCESS_PROFILE',
  
  // 街道评估系统权限
  ACCESS_DASHBOARD = 'ACCESS_DASHBOARD',
  MANAGE_STREET_EVALUATIONS = 'MANAGE_STREET_EVALUATIONS',
  VIEW_RATING_HISTORY = 'VIEW_RATING_HISTORY',
  COMPARE_RATINGS = 'COMPARE_RATINGS',
  
  // 照片管理权限
  MANAGE_ALL_PHOTOS = 'MANAGE_ALL_PHOTOS',
  UPLOAD_PHOTOS = 'UPLOAD_PHOTOS',
  
  // AI训练系统权限
  TRAIN_MODELS = 'TRAIN_MODELS',
  CONFIGURE_MODELS = 'CONFIGURE_MODELS',
  
  // 系统管理权限
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
  MANAGE_RATING_SETTINGS = 'MANAGE_RATING_SETTINGS',
  
  // 客户端权限
  ACCESS_MAP = 'ACCESS_MAP',
  SUBMIT_EVALUATIONS = 'SUBMIT_EVALUATIONS',
}

// 角色权限映射 - 定义每个角色拥有的权限
export const rolePermissions = {
  [Role.ADMIN]: [
    Permission.AUTHENTICATED,
    Permission.ACCESS_PROFILE,
    Permission.ACCESS_DASHBOARD,
    Permission.MANAGE_STREET_EVALUATIONS,
    Permission.VIEW_RATING_HISTORY,
    Permission.COMPARE_RATINGS,
    Permission.MANAGE_ALL_PHOTOS,
    Permission.UPLOAD_PHOTOS,
    Permission.TRAIN_MODELS,
    Permission.CONFIGURE_MODELS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.MANAGE_RATING_SETTINGS,
    Permission.ACCESS_MAP,
    Permission.SUBMIT_EVALUATIONS,
  ],
  
  [Role.CLIENT]: [
    Permission.AUTHENTICATED,
    Permission.ACCESS_PROFILE,
    Permission.ACCESS_DASHBOARD,
    Permission.VIEW_RATING_HISTORY,
    Permission.COMPARE_RATINGS,
    Permission.MANAGE_ALL_PHOTOS,
    Permission.UPLOAD_PHOTOS,
    Permission.ACCESS_MAP,
    Permission.SUBMIT_EVALUATIONS,
  ],
};

// 菜单权限映射 - 定义每个菜单项所需的权限
export const menuPermissionMap: Record<string, Permission | Permission[]> = {
  '/': Permission.AUTHENTICATED,
  '/profile': Permission.ACCESS_PROFILE,
  '/dashboard': Permission.ACCESS_DASHBOARD,
  '/street-evaluation': Permission.MANAGE_STREET_EVALUATIONS,
  '/rating-history': Permission.VIEW_RATING_HISTORY,
  '/rating-compare': Permission.COMPARE_RATINGS,
  '/photos': Permission.MANAGE_ALL_PHOTOS,
  '/upload': Permission.UPLOAD_PHOTOS,
  '/training': Permission.TRAIN_MODELS,
  '/model-config': Permission.CONFIGURE_MODELS,
  '/admin/users': Permission.MANAGE_USERS,
  '/admin/system': Permission.MANAGE_SYSTEM_SETTINGS,
  '/map': Permission.ACCESS_MAP,
};

// 路由权限映射 - 定义每个路由所需的权限
export const routePermissionMap: Record<string, Permission | Permission[]> = {
  '/': Permission.AUTHENTICATED,
  '/profile': Permission.ACCESS_PROFILE,
  '/dashboard': Permission.ACCESS_DASHBOARD,
  '/street-evaluation': Permission.MANAGE_STREET_EVALUATIONS,
  '/rating-history': Permission.VIEW_RATING_HISTORY,
  '/rating-compare': Permission.COMPARE_RATINGS,
  '/photos': Permission.MANAGE_ALL_PHOTOS,
  '/upload': Permission.UPLOAD_PHOTOS,
  '/training': Permission.TRAIN_MODELS,
  '/model-config': Permission.CONFIGURE_MODELS,
  '/admin/users': Permission.MANAGE_USERS,
  '/admin/system': Permission.MANAGE_SYSTEM_SETTINGS,
  '/map': Permission.ACCESS_MAP,
};