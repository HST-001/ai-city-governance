import React from 'react';
import { Avatar, Typography, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const CustomHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 用户菜单
  const userMenu = [
    {
      key: '1',
      label: (
        <span onClick={() => navigate('/profile')}>
          <SettingOutlined /> 个人设置
        </span>
      ),
    },
  ];

  return (
    <div className="flex justify-between items-center w-full h-full px-4">
      <div className="flex items-center">
        <Title level={4} className="m-0 text-blue-600">智慧城市治理系统</Title>
      </div>
      
      <div className="flex items-center space-x-4">
        {user && (
          <Space size="middle">
            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
              <Space className="cursor-pointer flex items-center">
                <Avatar icon={<UserOutlined />} />
                <Text className="hidden sm:inline">{user.username}</Text>
              </Space>
            </Dropdown>
            <a href="#"
              className="text-red-500 hover:text-red-700 flex items-center"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <LogoutOutlined />
              <span className="hidden sm:inline ml-1">退出登录</span>
            </a>
          </Space>
        )}
      </div>
    </div>
  );
};

export default CustomHeader;