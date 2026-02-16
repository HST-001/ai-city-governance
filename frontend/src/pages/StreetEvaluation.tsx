import React, { useState } from 'react';
import { Card, Table, Select, Space, Tag, Statistic, Row, Col, Progress, Rate } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

interface StreetEvaluation {
  id: string;
  name: string;
  category: string;
  rating: number;
  cleanliness: number;
  greenery: number;
  facilities: number;
  traffic: number;
  lastEvaluation: string;
  evaluator: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
}

const StreetEvaluation: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const mockData: StreetEvaluation[] = [
    {
      id: '1',
      name: '中山路',
      category: '主干道',
      rating: 4.8,
      cleanliness: 4.9,
      greenery: 4.7,
      facilities: 4.8,
      traffic: 4.6,
      lastEvaluation: '2024-01-15 10:30',
      evaluator: 'admin',
      status: 'excellent',
      issues: [],
    },
    {
      id: '2',
      name: '解放路',
      category: '主干道',
      rating: 4.6,
      cleanliness: 4.5,
      greenery: 4.8,
      facilities: 4.5,
      traffic: 4.6,
      lastEvaluation: '2024-01-14 14:20',
      evaluator: 'developer',
      status: 'good',
      issues: ['部分路段垃圾清理不及时'],
    },
    {
      id: '3',
      name: '建设路',
      category: '主干道',
      rating: 4.5,
      cleanliness: 4.3,
      greenery: 4.6,
      facilities: 4.7,
      traffic: 4.4,
      lastEvaluation: '2024-01-13 09:15',
      evaluator: 'admin',
      status: 'good',
      issues: ['绿化覆盖率偏低'],
    },
    {
      id: '4',
      name: '人民路',
      category: '主干道',
      rating: 4.4,
      cleanliness: 4.6,
      greenery: 4.2,
      facilities: 4.5,
      traffic: 4.3,
      lastEvaluation: '2024-01-12 16:45',
      evaluator: 'developer',
      status: 'good',
      issues: ['人行道维护不足'],
    },
    {
      id: '5',
      name: '和平路',
      category: '次干道',
      rating: 4.2,
      cleanliness: 4.0,
      greenery: 4.5,
      facilities: 4.1,
      traffic: 4.2,
      lastEvaluation: '2024-01-11 11:00',
      evaluator: 'admin',
      status: 'fair',
      issues: ['垃圾清理不及时', '设施老化'],
    },
    {
      id: '6',
      name: '胜利路',
      category: '次干道',
      rating: 4.0,
      cleanliness: 4.1,
      greenery: 4.0,
      facilities: 4.2,
      traffic: 3.7,
      lastEvaluation: '2024-01-10 15:30',
      evaluator: 'developer',
      status: 'fair',
      issues: ['绿化不足', '照明设施损坏'],
    },
    {
      id: '7',
      name: '光明路',
      category: '次干道',
      rating: 3.8,
      cleanliness: 3.9,
      greenery: 3.7,
      facilities: 3.8,
      traffic: 3.8,
      lastEvaluation: '2024-01-09 10:00',
      evaluator: 'admin',
      status: 'fair',
      issues: ['垃圾清理不及时', '路面破损'],
    },
    {
      id: '8',
      name: '前进路',
      category: '次干道',
      rating: 3.6,
      cleanliness: 3.8,
      greenery: 3.5,
      facilities: 3.7,
      traffic: 3.4,
      lastEvaluation: '2024-01-08 14:15',
      evaluator: 'developer',
      status: 'poor',
      issues: ['垃圾清理不及时', '绿化严重不足', '设施损坏'],
    },
    {
      id: '9',
      name: '红旗路',
      category: '支路',
      rating: 3.5,
      cleanliness: 3.6,
      greenery: 3.8,
      facilities: 3.5,
      traffic: 2.8,
      lastEvaluation: '2024-01-07 09:30',
      evaluator: 'admin',
      status: 'fair',
      issues: ['社区环境待改善'],
    },
    {
      id: '10',
      name: '幸福路',
      category: '支路',
      rating: 3.3,
      cleanliness: 3.5,
      greenery: 3.2,
      facilities: 3.4,
      traffic: 2.5,
      lastEvaluation: '2024-01-06 16:00',
      evaluator: 'developer',
      status: 'poor',
      issues: ['绿化不足', '垃圾清理不及时', '设施老化'],
    },
  ];

  const filteredData = selectedCategory === 'all' 
    ? mockData 
    : mockData.filter(item => item.category === selectedCategory);

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'cleanliness') return b.cleanliness - a.cleanliness;
    if (sortBy === 'greenery') return b.greenery - a.greenery;
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#52c41a';
      case 'good': return '#73d13d';
      case 'fair': return '#faad14';
      case 'poor': return '#ff4d4f';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'fair': return '一般';
      case 'poor': return '较差';
      default: return '未知';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircleOutlined />;
      case 'good': return <CheckCircleOutlined />;
      case 'fair': return <WarningOutlined />;
      case 'poor': return <CloseCircleOutlined />;
      default: return <EnvironmentOutlined />;
    }
  };

  const averageRating = mockData.reduce((sum, item) => sum + item.rating, 0) / mockData.length;
  const excellentCount = mockData.filter(item => item.status === 'excellent').length;
  const goodCount = mockData.filter(item => item.status === 'good').length;
  const fairCount = mockData.filter(item => item.status === 'fair').length;
  const poorCount = mockData.filter(item => item.status === 'poor').length;

  const columns = [
    {
      title: '街道名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record: StreetEvaluation) => (
        <Space>
          <strong>{name}</strong>
          <Tag color="blue">{record.category}</Tag>
        </Space>
      ),
    },
    {
      title: '综合评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating: number) => (
        <span style={{ color: getStatusColor(getStatusFromRating(rating)), fontWeight: 'bold', fontSize: 16 }}>
          {rating.toFixed(1)}
        </span>
      ),
    },
    {
      title: '清洁度',
      dataIndex: 'cleanliness',
      key: 'cleanliness',
      width: 100,
      render: (value: number) => <Progress percent={value * 20} size="small" status={value >= 4 ? 'success' : value >= 3 ? 'normal' : 'exception'} />,
    },
    {
      title: '绿化',
      dataIndex: 'greenery',
      key: 'greenery',
      width: 100,
      render: (value: number) => <Progress percent={value * 20} size="small" status={value >= 4 ? 'success' : value >= 3 ? 'normal' : 'exception'} />,
    },
    {
      title: '设施',
      dataIndex: 'facilities',
      key: 'facilities',
      width: 100,
      render: (value: number) => <Progress percent={value * 20} size="small" status={value >= 4 ? 'success' : value >= 3 ? 'normal' : 'exception'} />,
    },
    {
      title: '交通',
      dataIndex: 'traffic',
      key: 'traffic',
      width: 100,
      render: (value: number) => <Progress percent={value * 20} size="small" status={value >= 4 ? 'success' : value >= 3 ? 'normal' : 'exception'} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '评估者',
      dataIndex: 'evaluator',
      key: 'evaluator',
      width: 100,
    },
    {
      title: '评估时间',
      dataIndex: 'lastEvaluation',
      key: 'lastEvaluation',
      width: 180,
    },
  ];

  const getStatusFromRating = (rating: number) => {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 4.0) return 'good';
    if (rating >= 3.5) return 'fair';
    return 'poor';
  };

  return (
    <div className="street-evaluation-container">
      <Card title="街道乡镇评估">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic title="平均评分" value={averageRating} precision={1} suffix="分" />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="优秀街道" value={excellentCount} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="良好街道" value={goodCount} valueStyle={{ color: '#73d13d' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="需改进街道" value={fairCount + poorCount} valueStyle={{ color: '#faad14' }} />
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
                <Option value="rating">按综合评分</Option>
                <Option value="cleanliness">按清洁度</Option>
                <Option value="greenery">按绿化</Option>
              </Select>
            </Space>
          </Card>

          <Card title="街道评估列表" style={{ marginTop: 16 }}>
            <Table
              columns={columns}
              dataSource={sortedData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              onRow={(record) => ({
                style: { cursor: 'pointer' },
              })}
              expandable={{
                expandedRowRender: (record) => (
                  <Card size="small" style={{ margin: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <strong>详细评分：</strong>
                        <div style={{ marginTop: 8 }}>
                          <Space size="large">
                            <div>
                              <div>清洁度</div>
                              <Rate disabled value={record.cleanliness} style={{ fontSize: 14 }} />
                            </div>
                            <div>
                              <div>绿化</div>
                              <Rate disabled value={record.greenery} style={{ fontSize: 14 }} />
                            </div>
                            <div>
                              <div>设施</div>
                              <Rate disabled value={record.facilities} style={{ fontSize: 14 }} />
                            </div>
                            <div>
                              <div>交通</div>
                              <Rate disabled value={record.traffic} style={{ fontSize: 14 }} />
                            </div>
                          </Space>
                        </div>
                      </div>
                      {record.issues.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <strong>存在问题：</strong>
                          <div style={{ marginTop: 8 }}>
                            {record.issues.map((issue, index) => (
                              <Tag key={index} color="red" style={{ margin: '4px' }}>
                                {issue}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: 16 }}>
                        <Space>
                          <span><strong>评估者：</strong>{record.evaluator}</span>
                          <span><strong>评估时间：</strong>{record.lastEvaluation}</span>
                        </Space>
                      </div>
                    </Space>
                  </Card>
                ),
              }}
            />
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default StreetEvaluation;