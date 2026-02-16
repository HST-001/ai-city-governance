import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Role, Permission } from '../types/rolePermissions';

// Auth Hook 返回类型
interface AuthHookReturn {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
}

// Mock测试用户数据 - 管理员
const mockAdminUser: User = {
  id: '1',
  username: 'admin',
  role: Role.ADMIN,
  permissions: [
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
  email: 'admin@example.com',
  enabled: true
};

// Mock测试用户数据 - 开发人员
const mockDeveloperUser: User = {
  id: '2',
  username: 'developer',
  role: Role.DEVELOPER,
  permissions: [
    Permission.AUTHENTICATED,
    Permission.ACCESS_PROFILE,
    Permission.ACCESS_DASHBOARD,
    Permission.MANAGE_ALL_PHOTOS,
    Permission.UPLOAD_PHOTOS,
    Permission.TRAIN_MODELS, // 开发人员有训练权限
    Permission.CONFIGURE_MODELS,
    Permission.VIEW_RATING_HISTORY,
    Permission.COMPARE_RATINGS,
  ],
  email: 'dev@example.com',
  enabled: true
};

// Mock测试用户数据 - 普通用户
const mockClientUser: User = {
  id: '3',
  username: 'client',
  role: Role.CLIENT,
  permissions: [
    Permission.AUTHENTICATED,
    Permission.ACCESS_PROFILE,
    Permission.ACCESS_MAP,
    Permission.SUBMIT_EVALUATIONS,
  ],
  email: 'client@example.com',
  enabled: true
};

export const useAuth = (): AuthHookReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 检查本地存储中的认证状态
    const checkAuth = () => {
      console.log('useAuth: 开始检查认证状态');
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            console.log('useAuth: 发现本地存储中的用户信息');
            const parsedUser = JSON.parse(savedUser) as User;
            // 验证用户对象结构的完整性
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.username && parsedUser.permissions) {
              setUser(parsedUser);
              setIsAuthenticated(true);
              console.log('useAuth: 已设置用户状态:', { username: parsedUser.username, isAuthenticated: true });
            } else {
              console.warn('useAuth: 本地存储中的用户数据格式不正确，已清除');
              localStorage.removeItem('currentUser');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (parseError) {
            console.error('useAuth: 解析本地存储用户数据失败:', parseError);
            localStorage.removeItem('currentUser');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('useAuth: 本地存储中未发现用户信息');
          // 移除自动登录，让用户手动登录
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('useAuth: 检查认证状态时出错:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        console.log('useAuth: 认证状态检查完成，loading=false');
      }
    };

    checkAuth();
  }, []);

  // 登录方法
  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('useAuth: 执行登录操作:', { username });
    try {
      setLoading(true);
      
      // 输入验证
      if (!username || !password) {
        console.error('useAuth: 用户名和密码不能为空');
        return false;
      }
      
      // 模拟登录验证
      if (username === 'admin' && password === 'admin') {
        console.log('useAuth: 管理员登录成功');
        setUser(mockAdminUser);
        localStorage.setItem('currentUser', JSON.stringify(mockAdminUser));
        setIsAuthenticated(true);
        return true;
      } else if (username === 'developer' && password === 'dev') {
        console.log('useAuth: 开发人员登录成功');
        setUser(mockDeveloperUser);
        localStorage.setItem('currentUser', JSON.stringify(mockDeveloperUser));
        setIsAuthenticated(true);
        return true;
      } else if (username === 'client' && password === 'client') {
        console.log('useAuth: 客户端用户登录成功');
        setUser(mockClientUser);
        localStorage.setItem('currentUser', JSON.stringify(mockClientUser));
        setIsAuthenticated(true);
        return true;
      }
      console.log('useAuth: 登录失败 - 用户名或密码不正确');
      return false;
    } catch (error) {
      console.error('useAuth: 登录失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 注册方法
  const register = async (username: string, email: string, password: string, phone?: string): Promise<boolean> => {
    console.log('useAuth: 执行注册操作:', { username, email });
    try {
      setLoading(true);
      
      // 输入验证
      if (!username || !email || !password) {
        console.error('useAuth: 用户名、邮箱和密码不能为空');
        return false;
      }
      
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('useAuth: 邮箱格式不正确');
        return false;
      }
      
      // 模拟注册
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        phone,
        role: Role.CLIENT, // 新注册用户默认为客户端角色
        permissions: [
          Permission.AUTHENTICATED,
          Permission.ACCESS_PROFILE,
          Permission.ACCESS_MAP,
          Permission.SUBMIT_EVALUATIONS,
        ],
        enabled: true
      };
      
      // 在实际应用中，这里应该调用API进行注册
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setIsAuthenticated(true);
      console.log('useAuth: 注册成功，用户已登录');
      return true;
    } catch (error) {
      console.error('useAuth: 注册失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    console.log('useAuth: 执行登出操作');
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('useAuth: 清除本地存储时出错:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
    console.log('useAuth: 登出成功，清除所有用户状态');
  };

  // 检查是否有特定权限
  const hasPermission = (permission: Permission): boolean => {
    // 确保user和permissions都存在，避免空指针异常
    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }
    const result = user.permissions.includes(permission);
    return result;
  };

  // 检查是否有特定角色
  const hasRole = (role: Role): boolean => {
    const result = user?.role === role;
    return result;
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
  };
};