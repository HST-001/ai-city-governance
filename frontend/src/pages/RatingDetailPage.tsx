import React from 'react';
import { Card, Empty, Spin } from 'antd';
import { useParams } from 'react-router-dom';

interface RatingDetailPageProps {}

const RatingDetailPage: React.FC<RatingDetailPageProps> = () => {
  const { ratingId } = useParams<{ ratingId: string }>();
  const loading = false;

  return (
    <div className="rating-detail-container">
      <Card title={`评分详情 ${ratingId}`}>
        <Spin spinning={loading}>
          <Empty description="评分详情组件"></Empty>
        </Spin>
      </Card>
    </div>
  );
};

export default RatingDetailPage;