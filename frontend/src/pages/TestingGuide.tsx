import React from 'react';
import { Card, Typography, Divider, List, Tag } from 'antd';
import { LockOutlined, UserOutlined, SolutionOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';

const { Title, Paragraph } = Typography;

const TestingGuide: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isDeveloper, isClient, getUserPermissionDescription } = usePermission();
  
  const currentRole = user?.role || '未登录';
  
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        角色权限测试指南
      </Title>
      
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <UserOutlined />
          <Title level={4} style={{ margin: 0 }}>当前用户信息</Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <Paragraph>
              <strong>用户名:</strong> {user?.username || '未登录'}
            </Paragraph>
            <Paragraph>
              <strong>当前角色:</strong> 
              <Tag color={
                isAdmin ? 'red' : 
                isDeveloper ? 'orange' : 
                isClient ? 'green' : 'default'
              }>
                {currentRole}
              </Tag>
            </Paragraph>
            <Paragraph>
              <strong>权限描述:</strong> {getUserPermissionDescription()}
            </Paragraph>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <LockOutlined />
          <Title level={4} style={{ margin: 0 }}>角色权限说明</Title>
        </div>
        <div>
          <div style={{ marginBottom: 24 }}>
            <Title level={5}>管理员 (ADMIN)</Title>
            <Paragraph>拥有系统全部功能的访问和管理权限，包括：</Paragraph>
            <List size="small" bordered>
              <List.Item>访问和使用所有基础功能</List.Item>
              <List.Item>管理所有用户上传的照片</List.Item>
              <List.Item>训练AI模型和查看训练历史</List.Item>
              <List.Item>配置AI模型参数</List.Item>
            </List>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Title level={5}>开发人员 (DEVELOPER)</Title>
            <Paragraph>拥有基本功能和AI训练功能的访问权限，但不能修改系统配置：</Paragraph>
            <List size="small" bordered>
              <List.Item>访问和使用所有基础功能</List.Item>
              <List.Item>管理所有用户上传的照片</List.Item>
              <List.Item>训练AI模型和查看训练历史</List.Item>
              <List.Item style={{ opacity: 0.5 }}>不能配置AI模型参数</List.Item>
            </List>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Title level={5}>客户端用户 (CLIENT)</Title>
            <Paragraph>拥有基础功能的访问权限，但不能使用高级管理和AI训练功能：</Paragraph>
            <List size="small" bordered>
              <List.Item>访问和使用所有基础功能</List.Item>
              <List.Item>上传和管理自己的照片</List.Item>
              <List.Item style={{ opacity: 0.5 }}>不能管理其他用户的照片</List.Item>
              <List.Item style={{ opacity: 0.5 }}>不能访问AI训练和管理功能</List.Item>
            </List>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <SolutionOutlined />
          <Title level={4} style={{ margin: 0 }}>测试流程</Title>
        </div>
        <Paragraph>请使用以下账号测试不同角色的权限体验：</Paragraph>
        
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: '管理员账号',
              username: 'admin',
              password: '123456',
              role: '管理员',
              testPoints: ['访问所有页面', '尝试管理照片', '训练模型', '配置模型参数']
            },
            {
              title: '开发人员账号',
              username: 'developer',
              password: '123456',
              role: '开发人员',
              testPoints: ['访问基础页面', '尝试训练模型', '尝试访问模型配置页面(应该被拒绝)']
            },
            {
              title: '普通用户账号',
              username: 'client',
              password: '123456',
              role: '客户端用户',
              testPoints: ['访问基础页面', '尝试上传照片', '尝试访问照片管理页面(应该被拒绝)', '尝试访问AI训练页面(应该被拒绝)']
            }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <div>
                    {item.title}
                    <Tag color={
                      item.role === '管理员' ? 'red' : 
                      item.role === '开发人员' ? 'orange' : 'green'
                    } style={{ marginLeft: 8 }}>{item.role}</Tag>
                  </div>
                }
                description={
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <strong>账号:</strong> {item.username} | 
                      <strong> 密码:</strong> {item.password}
                    </div>
                    <div>
                      <strong>测试要点:</strong>
                      <ul style={{ margin: '8px 0 0 0' }}>
                        {item.testPoints.map((point, index) => (
                          <li key={index} style={{ marginBottom: 4 }}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
        
        <Divider />
        
        <Paragraph strong>重要权限控制测试项：</Paragraph>
        <List
          size="small"
          dataSource={[
            '测试照片管理页面 (应仅管理员和开发人员可访问)',
            '测试AI训练页面 (应仅管理员和开发人员可访问)',
            '测试模型配置页面 (应仅管理员可访问)',
            '检查侧边栏菜单是否根据当前角色显示相应选项',
            '测试Dashboard页面是否根据角色显示不同内容',
          ]}
          renderItem={item => <List.Item>• {item}</List.Item>}
        />
      </Card>
    </div>
  );
};

export default TestingGuide;
