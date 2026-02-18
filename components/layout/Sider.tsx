import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutOutlined,
  FundViewOutlined,
  FormOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  UploadOutlined,
  UserOutlined,
  BarChartOutlined,
  BlockOutlined,
  CodeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { menuPermissionMap, Permission } from '../../types/rolePermissions';

const { Sider } = Layout;

const CustomSider: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  // 当位置变化时更新选中的key
  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  // 处理菜单项点击事件
  const handleMenuClick = (e: any) => {
    const path = e.key;
    // 确保路径以'/'开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    navigate(normalizedPath);
  };

  // 检查用户是否有权限访问某个菜单项
  const hasPermission = (menuKey: string): boolean => {
    if (!user || !user.permissions) return false;
    
    // 从menuPermissionMap获取需要的权限
    const requiredPermissions = menuPermissionMap[menuKey];
    
    // 如果菜单项不需要权限，则返回true
    if (!requiredPermissions) return true;
    
    // 如果是单个权限，检查用户是否拥有该权限
    if (typeof requiredPermissions === 'string') {
      return user.permissions.includes(requiredPermissions);
    }
    
    // 如果是权限数组，检查用户是否拥有所有权限
    if (Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
      return requiredPermissions.every(permission => 
        user.permissions?.includes(permission)
      );
    }
    
    return true;
  };

  return (
    <Sider width={256} theme="light" className="app-sider">
      <div className="logo" style={{ padding: '20px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
        城市治理系统
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        style={{ height: '100%', borderRight: 0 }}
      >
        {/* 管理控制台 - 按功能模块组织 */}
        <Menu.SubMenu key="management_console" icon={<LayoutOutlined />} title="管理控制台">
          {/* 数据管理 */}
          <Menu.SubMenu key="data_management" icon={<FundViewOutlined />} title="数据管理">
            {hasPermission('/dashboard') && (
              <Menu.Item key="/dashboard" icon={<BarChartOutlined />}>
                数据面板
              </Menu.Item>
            )}
            {hasPermission('/evaluation') && (
              <Menu.Item key="/evaluation" icon={<FormOutlined />}>
                街道乡镇评估
              </Menu.Item>
            )}
          </Menu.SubMenu>
          
          {/* 评分管理 */}
          <Menu.SubMenu key="rating_management" icon={<BlockOutlined />} title="评分管理">
            {hasPermission('/score/history') && (
              <Menu.Item key="/score/history" icon={<BarChartOutlined />}>
                评分历史
              </Menu.Item>
            )}
            {hasPermission('/score/compare') && (
              <Menu.Item key="/score/compare" icon={<BlockOutlined />}>
                评分对比
              </Menu.Item>
            )}
          </Menu.SubMenu>
          
          {/* 照片管理 */}
          <Menu.SubMenu key="photo_management" icon={<PictureOutlined />} title="照片管理">
            {hasPermission('/upload') && (
              <Menu.Item key="/upload" icon={<UploadOutlined />}>
                照片上传
              </Menu.Item>
            )}
            {hasPermission('/photos') && (
              <Menu.Item key="/photos" icon={<PictureOutlined />}>
                照片管理
              </Menu.Item>
            )}
          </Menu.SubMenu>
          
          {/* AI模型管理 - 开发人员功能 */}
          {user?.permissions?.includes(Permission.TRAIN_MODELS) && (
            <Menu.SubMenu key="ai_management" icon={<CodeOutlined />} title="AI模型管理">
              {hasPermission('/training') && (
                <Menu.Item key="/training" icon={<SettingOutlined />}>
                  模型训练
                </Menu.Item>
              )}
              {hasPermission('/model-config') && (
                <Menu.Item key="/model-config" icon={<SettingOutlined />}>
                  模型配置
                </Menu.Item>
              )}
            </Menu.SubMenu>
          )}
          
          {/* 系统管理 - 仅管理员可见 */}
          {user?.permissions?.includes(Permission.MANAGE_USERS) && (
            <Menu.SubMenu key="system_management" icon={<SettingOutlined />} title="系统管理">
              {hasPermission('/admin/users') && (
                <Menu.Item key="/admin/users" icon={<UserSwitchOutlined />}>
                  用户管理
                </Menu.Item>
              )}
              {hasPermission('/admin/system') && (
                <Menu.Item key="/admin/system" icon={<SettingOutlined />}>
                  系统设置
                </Menu.Item>
              )}
            </Menu.SubMenu>
          )}
        </Menu.SubMenu>

        {/* 客户端口 - 普通用户功能 */}
        <Menu.SubMenu key="client_port" icon={<AppstoreOutlined />} title="客户端口">
          {hasPermission('/map') && (
            <Menu.Item key="/map" icon={<EnvironmentOutlined />}>
              地图视图
            </Menu.Item>
          )}
        </Menu.SubMenu>

        {/* 用户信息 - 所有登录用户可见 */}
        {hasPermission('/profile') && (
          <Menu.Item key="/profile" icon={<UserOutlined />}>
            个人信息
          </Menu.Item>
        )}
      </Menu>
    </Sider>
  );
};

export default CustomSider;