import React from 'react';
import { Card, Empty } from 'antd';

interface NotFoundProps {}

const NotFound: React.FC<NotFoundProps> = () => {
  return (
    <div className="not-found-container">
      <Card title="页面未找到">
        <Empty description="404 - 页面不存在"></Empty>
      </Card>
    </div>
  );
};

export default NotFound;