import React from 'react';
import { Button, Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <Title level={1}>测试页面</Title>
      <Paragraph>这是一个简单的测试页面，用于验证React和Ant Design组件能否正常渲染。</Paragraph>
      <Card title="测试卡片" style={{ maxWidth: 400, margin: '0 auto' }}>
        <p>如果您能看到这个卡片，说明React组件渲染正常。</p>
        <Button type="primary" style={{ marginTop: 16 }}>测试按钮</Button>
      </Card>
    </div>
  );
};

export default TestPage;