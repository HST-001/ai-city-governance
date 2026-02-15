import React from 'react';
import { Layout } from 'antd';
import { Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

const CustomFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center' }}>
      <Text type="secondary">
        AI+城市治理系统 ©{new Date().getFullYear()} Created by Team
      </Text>
    </Footer>
  );
};

export default CustomFooter;