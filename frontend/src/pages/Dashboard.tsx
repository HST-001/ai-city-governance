import React from 'react';
import { Typography, Row, Col, Card, Statistic, Divider } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/rolePermissions';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // 根据用户角色显示不同的欢迎信息
  const getWelcomeMessage = () => {
    if (!user) return '';
    
    switch (user.role) {
      case Role.ADMIN:
        return '欢迎使用城市街道管理系统，作为管理员您可以管理用户、配置系统和监督所有功能。';
      case Role.CLIENT:
        return '欢迎使用城市街道管理系统，您可以访问照片管理、AI训练系统和维护街道评估功能。';
      default:
        return '欢迎使用城市街道管理系统。';
    }
  };

  // 根据用户角色显示不同的功能入口卡片
  const getFeatureCards = () => {
    if (!user) return [];

    // 公共卡片
    const commonCards = [
      {
        title: '街道乡镇评估',
        description: '查看和管理街道乡镇评级信息',
        link: '/street-evaluation',
      },
      {
        title: '地图视图',
        description: '在地图上查看街道乡镇评级分布',
        link: '/map',
      },
    ];

    // 仅管理员和开发人员可见的卡片
    const adminDevCards = [
      {
        title: 'AI训练系统',
        description: '训练和配置图像评分AI模型',
        link: '/model-training',
      },
      {
        title: '照片管理',
        description: '上传和管理街道照片',
        link: '/photo-management',
      },
    ];

    // 仅管理员可见的卡片
    const adminOnlyCards = [
      {
        title: '系统配置',
        description: '配置系统参数和权限设置',
        link: '/model-configuration',
      },
    ];

    // 根据用户角色组合卡片
    let cards = [...commonCards];
    
    if (user.role === Role.ADMIN || user.role === Role.CLIENT) {
      cards = [...cards, ...adminDevCards];
    }
    
    if (user.role === Role.ADMIN) {
      cards = [...cards, ...adminOnlyCards];
    }

    return cards;
  };

  const featureCards = getFeatureCards();

  return (
    <div className="dashboard-container">
      <Title level={2}>仪表盘</Title>
      <Paragraph>{getWelcomeMessage()}</Paragraph>
      <Divider />
      
      <Title level={4}>统计信息</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="街道总数" value={128} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已评估街道" value={95} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均评分" value={4.2} precision={1} suffix="分" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="照片总数" value={2450} />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Title level={4}>功能入口</Title>
      <Row gutter={16}>
        {featureCards.map((card, index) => (
          <Col span={6} key={index}>
            <Card 
              title={card.title} 
              hoverable 
              onClick={() => window.location.href = card.link}
              style={{ cursor: 'pointer' }}
            >
              <p>{card.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
      
      {user && (
        <div style={{ marginTop: '24px' }}>
          <Divider />
          <Title level={4}>角色权限说明</Title>
          <Paragraph>
            当前角色: {user.role === Role.ADMIN ? '管理员' : '客户端用户'}
          </Paragraph>
          <Paragraph>
            {user.role === Role.ADMIN && '管理员拥有所有权限，可以管理用户、配置系统参数、监督所有功能模块。'}
            {user.role === Role.CLIENT && '客户端用户可以访问照片管理、AI训练系统和维护街道评估功能。'}
          </Paragraph>
        </div>
      )}
    </div>
  );
};

export default Dashboard;