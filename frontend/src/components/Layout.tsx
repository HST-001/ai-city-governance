import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar, Badge, Tooltip, Empty, Spin, Button } from 'antd';
import { UserOutlined, MenuOutlined, LogoutOutlined, SettingOutlined, HomeOutlined, FileTextOutlined, 
         BarChartOutlined, UploadOutlined, PictureOutlined, TeamOutlined, DatabaseOutlined, 
         AreaChartOutlined, AuditOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { Role } from '../types/rolePermissions';
import './Layout.css';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { filterMenuByPermission } = usePermission();
  
  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 根据当前路由设置菜单选中项
  useEffect(() => {
    const path = location.pathname;
    // 根据路径设置对应的key
    if (path.startsWith('/dashboard')) setCurrentKey('dashboard');
    else if (path.startsWith('/street-evaluation')) setCurrentKey('street-evaluation');
    else if (path.startsWith('/rating-history')) setCurrentKey('rating-history');
    else if (path.startsWith('/compare-ratings')) setCurrentKey('compare-ratings');
    else if (path.startsWith('/photo-upload')) setCurrentKey('photo-upload');
    else if (path.startsWith('/photo-management')) setCurrentKey('photo-management');
    else if (path.startsWith('/map')) setCurrentKey('map');
    else if (path.startsWith('/profile')) setCurrentKey('profile');
    else if (path.startsWith('/model-training')) setCurrentKey('model-training');
    else if (path.startsWith('/model-configuration')) setCurrentKey('model-configuration');
    else if (path.startsWith('/testing-guide')) setCurrentKey('testing-guide');
  }, [location.pathname]);
  
  // 初始化菜单项目
  useEffect(() => {
    const initMenuItems = () => {
      const allItems = [
        {
          key: 'dashboard',
          icon: <HomeOutlined />,
          label: '控制面板',
          path: '/dashboard'
        },
        {
          key: 'street-evaluation',
          icon: <BarChartOutlined />,
          label: '街道乡镇评估',
          path: '/street-evaluation'
        },
        {
          key: 'rating-history',
          icon: <FileTextOutlined />,
          label: '评级历史',
          path: '/rating-history'
        },
        {
          key: 'compare-ratings',
          icon: <AreaChartOutlined />,
          label: '评级对比',
          path: '/compare-ratings'
        },
        {
          key: 'photo-upload',
          icon: <UploadOutlined />,
          label: '照片上传',
          path: '/photo-upload'
        },
        {
          key: 'photo-management',
          icon: <PictureOutlined />,
          label: '照片管理',
          path: '/photo-management',
          requiredRoles: [Role.ADMIN, Role.CLIENT]
        },
        {
          key: 'map',
          icon: <AreaChartOutlined />,
          label: '地图视图',
          path: '/map'
        },
        {
          key: 'model-training',
          icon: <DatabaseOutlined />,
          label: '模型训练',
          path: '/model-training',
          requiredRoles: [Role.ADMIN, Role.CLIENT]
        },
        {
          key: 'model-configuration',
          icon: <SettingOutlined />,
          label: '模型配置',
          path: '/model-configuration',
          requiredRoles: [Role.ADMIN]
        },
        {
          key: 'testing-guide',
          icon: <CheckSquareOutlined />,
          label: '测试指南',
          path: '/testing-guide'
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: '个人设置',
          path: '/profile'
        }
      ];

      // 根据用户权限过滤菜单项
      const filteredItems = filterMenuByPermission(allItems);
      setMenuItems(filteredItems);
      setLoading(false);
    };

    initMenuItems();
  }, [filterMenuByPermission]);

  // 菜单项点击处理 - 增强版
  const handleMenuClick = (e: any) => {
    console.log('===== 菜单点击事件触发 =====', e);
    // 直接从菜单定义数组中查找路径并导航
    const clickedItem = menuItems.find(item => item.key === e.key);
    
    if (clickedItem) {
      console.log('找到菜单项:', clickedItem);
      
      if (clickedItem.path) {
        console.log('准备导航到:', clickedItem.path);
        
        // 尝试不同的导航方式
        try {
          // 方法1: 使用React Router navigate
          console.log('尝试方法1: React Router navigate');
          navigate(clickedItem.path, { replace: true });
          
          // 方法2: 使用标准JavaScript方式 (在下一个事件循环中执行，以防方法1失败)
          setTimeout(() => {
            console.log('尝试方法2: window.location.pathname');
            if (window.location.pathname !== clickedItem.path) {
              console.log('方法1可能失败，使用备用导航方式');
              window.location.pathname = clickedItem.path;
            } else {
              console.log('方法1成功，路径已更新');
            }
          }, 100);
        } catch (error) {
          console.error('导航错误:', error);
          // 失败时的备用方案
          window.location.href = window.location.origin + clickedItem.path;
        }
      } else {
        console.log('警告: 菜单项没有路径属性');
      }
    } else {
      console.log('警告: 未找到对应菜单项');
    }
  };
  
  // 移除重复的useEffect，只保留一个增强版
  useEffect(() => {
    console.log('===== Layout组件加载/更新 =====');
    console.log('当前路径:', location.pathname);
    console.log('菜单选中键:', currentKey);
    console.log('可用菜单项数量:', menuItems.length);
    console.log('菜单项列表:', menuItems);
    
    // 如果菜单项已初始化完成，进行额外检查
    if (menuItems.length > 0) {
      console.log('菜单项初始化完成，共', menuItems.length, '个项目');
      // 确保所有菜单项都有path属性
      menuItems.forEach(item => {
        if (!item.path) {
          console.warn('菜单项', item.key, '缺少path属性');
        }
      });
    }
  }, [location.pathname, currentKey, menuItems]);

  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  // 用户头像组件
  const userAvatar = (
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
      <div className="user-avatar">
        <Avatar icon={user?.avatarUrl ? null : <UserOutlined />} src={user?.avatarUrl}>
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <span className="user-name">{user?.username || '用户'}</span>
      </div>
    </Dropdown>
  );
  // 检查是否有权限访问当前页面 - 暂时简化为总是返回true以便调试
  const hasAccessToCurrentPage = () => {
    console.log('检查页面访问权限，当前路径:', location.pathname);
    console.log('当前可用菜单项:', menuItems);
    // 为了测试，暂时总是返回true，绕过权限检查
    return true;
  };

  return (
    <AntLayout className="main-layout" style={{ minHeight: '100vh' }}>
      <Header className="main-header">
        <div className="header-left">
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            className="menu-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          />
          <span className="system-title">城市治理系统</span>
        </div>
        <div className="header-right">
          {userAvatar}
        </div>
      </Header>

      <AntLayout>
        <Sider
          collapsible
          collapsed={collapsed}
          className="main-sider"
          width={240}
          theme="light"
          onCollapse={value => setCollapsed(value)}
          style={{ overflow: 'hidden' }}
        >
          <div className="sider-content">
            <div className="menu-container">
              <div className="logo-container">
                <h1 className="logo-text">{collapsed ? '城治' : '城市治理系统'}</h1>
              </div>
              {loading ? (
                <div className="menu-loading">
                  <Spin size="small" />
                </div>
              ) : (
                <Menu
                  mode="inline"
                  selectedKeys={[currentKey]}
                  onClick={handleMenuClick}
                  items={menuItems.map(item => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    // 不再在items中传递自定义属性，直接在handleMenuClick中使用原始数组
                  }))}
                  className="main-menu"
                />
              )}
            </div>
          </div>
        </Sider>

        <Content className="main-content">
          <div className="content-container">
            {hasAccessToCurrentPage() ? (
              <Outlet />
            ) : (
              <Empty 
                description="您没有权限访问当前页面" 
                className="permission-error"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/dashboard')}>返回首页</Button>
              </Empty>
            )}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;