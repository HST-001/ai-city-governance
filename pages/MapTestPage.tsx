import React from 'react';
import { Card, Empty } from 'antd';

interface MapTestPageProps {}

const MapTestPage: React.FC<MapTestPageProps> = () => {
  return (
    <div className="map-test-container">
      <Card title="地图测试">
        <Empty description="地图测试页面"></Empty>
      </Card>
    </div>
  );
};

export default MapTestPage;