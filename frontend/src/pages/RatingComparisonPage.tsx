import React, { useState } from 'react';
import { Card, Table, Select, Space, Tag, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Option } = Select;

interface StreetRating {
  id: string;
  name: string;
  rating: number;
  change: number;
  rank: number;
  category: string;
  lastRating: number;
  evaluationCount: number;
}

const RatingComparisonPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const mockData: StreetRating[] = [
    {
      id: '1',
      name: '中山路',
      rating: 4.8,
      change: 0.3,
      rank: 1,
      category: '主干道',
      lastRating: 4.5,
      evaluationCount: 12,
    },
    {
      id: '2',
      name: '解放路',
      rating: 4.6,
      change: 0.1,
      rank: 2,
      category: '主干道',
      lastRating: 4.5,
      evaluationCount: 10,
    },
    {
      id: '3',
      name: '建设路',
      rating: 4.5,
      change: -0.2,
      rank: 3,
      category: '主干道',
      lastRating: 4.7,
      evaluationCount: 8,
    },
    {
      id: '4',
      name: '人民路',
      rating: 4.4,
      change: 0.2,
      rank: 4,
      category: '主干道',
      lastRating: 4.2,
      evaluationCount: 9,
    },
    {
      id: '5',
      name: '和平路',
      rating: 4.2,
      change: 0.1,
      rank: 5,
      category: '次干道',
      lastRating: 4.1,
      evaluationCount: 7,
    },
    {
      id: '6',
      name: '胜利路',
      rating: 4.0,
      change: -0.1,
      rank: 6,
      category: '次干道',
      lastRating: 4.1,
      evaluationCount: 6,
    },
    {
      id: '7',
      name: '光明路',
      rating: 3.8,
      change: 0.3,
      rank: 7,
      category: '次干道',
      lastRating: 3.5,
      evaluationCount: 5,
    },
    {
      id: '8',
      name: '前进路',
      rating: 3.6,
      change: -0.2,
      rank: 8,
      category: '次干道',
      lastRating: 3.8,
      evaluationCount: 4,
    },
    {
      id: '9',
      name: '红旗路',
      rating: 3.5,
      change: 0.1,
      rank: 9,
      category: '支路',
      lastRating: 3.4,
      evaluationCount: 3,
    },
    {
      id: '10',
      name: '幸福路',
      rating: 3.3,
      change: -0.1,
      rank: 10,
      category: '支路',
      lastRating: 3.4,
      evaluationCount: 2,
    },
  ];

  const filteredData = selectedCategory === 'all' 
    ? mockData 
    : mockData.filter(item => item.category === selectedCategory);

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'change') return b.change - a.change;
    if (sortBy === 'rank') return a.rank - b.rank;
    return 0;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 4.0) return '#73d13d';
    if (rating >= 3.5) return '#faad14';
    if (rating >= 3.0) return '#fa8c16';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <Tag color={rank <= 3 ? 'gold' : rank <= 6 ? 'blue' : 'default'} style={{ fontSize: 14, fontWeight: 'bold' }}>
          #{rank}
        </Tag>
      ),
    },
    {
      title: '街道名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '当前评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating: number) => (
        <span style={{ color: getRatingColor(rating), fontWeight: 'bold', fontSize: 16 }}>
          {rating.toFixed(1)}
        </span>
      ),
    },
    {
      title: '上次评分',
      dataIndex: 'lastRating',
      key: 'lastRating',
      width: 120,
      render: (rating: number) => rating.toFixed(1),
    },
    {
      title: '变化',
      dataIndex: 'change',
      key: 'change',
      width: 100,
      render: (change: number) => (
        <Space>
          {change > 0 ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : change < 0 ? (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
          ) : (
            <span>-</span>
          )}
          <span style={{ color: change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#999' }}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}
          </span>
        </Space>
      ),
    },
    {
      title: '评估次数',
      dataIndex: 'evaluationCount',
      key: 'evaluationCount',
      width: 100,
    },
  ];

  const averageRating = mockData.reduce((sum, item) => sum + item.rating, 0) / mockData.length;
  const topRated = mockData[0];
  const mostImproved = mockData.reduce((max, item) => item.change > max.change ? item : max, mockData[0]);

  return (
    <div className="rating-comparison-container">
      <Card title="评分比较">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic title="平均评分" value={averageRating} precision={1} suffix="分" />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="最高评分" value={topRated.rating} precision={1} suffix="分" />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {topRated.name}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="最大提升" value={mostImproved.change} precision={1} suffix="分" />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {mostImproved.name}
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="筛选条件" style={{ marginTop: 16 }}>
            <Space>
              <span>街道类别：</span>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 150 }}
              >
                <Option value="all">全部</Option>
                <Option value="主干道">主干道</Option>
                <Option value="次干道">次干道</Option>
                <Option value="支路">支路</Option>
              </Select>
              <span>排序方式：</span>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 150 }}
              >
                <Option value="rating">按评分</Option>
                <Option value="change">按变化</Option>
                <Option value="rank">按排名</Option>
              </Select>
            </Space>
          </Card>

          <Card title="街道评分排名" style={{ marginTop: 16 }}>
            <Table
              columns={columns}
              dataSource={sortedData}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default RatingComparisonPage;