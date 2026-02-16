import React, { useState } from 'react';
import { Card, Timeline, Tag, Space, Select, DatePicker, Statistic, Row, Col } from 'antd';
import { ClockCircleOutlined, ArrowUpOutlined } from '@ant-design/icons';

const { Option } = Select;

interface HistoryRecord {
  id: string;
  streetName: string;
  oldRating: number;
  newRating: number;
  change: number;
  evaluator: string;
  evaluationDate: string;
  category: string;
  remarks: string;
}

const RatingHistoryPage: React.FC = () => {
  const [selectedStreet, setSelectedStreet] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const mockHistory: HistoryRecord[] = [
    {
      id: '1',
      streetName: '中山路',
      oldRating: 4.5,
      newRating: 4.8,
      change: 0.3,
      evaluator: 'admin',
      evaluationDate: '2024-01-15 10:30',
      category: '主干道',
      remarks: '道路清洁度提升',
    },
    {
      id: '2',
      streetName: '解放路',
      oldRating: 4.5,
      newRating: 4.6,
      change: 0.1,
      evaluator: 'developer',
      evaluationDate: '2024-01-14 14:20',
      category: '主干道',
      remarks: '绿化覆盖率提升',
    },
    {
      id: '3',
      streetName: '建设路',
      oldRating: 4.7,
      newRating: 4.5,
      change: -0.2,
      evaluator: 'admin',
      evaluationDate: '2024-01-13 09:15',
      category: '主干道',
      remarks: '设施维护待改进',
    },
    {
      id: '4',
      streetName: '人民路',
      oldRating: 4.2,
      newRating: 4.4,
      change: 0.2,
      evaluator: 'developer',
      evaluationDate: '2024-01-12 16:45',
      category: '主干道',
      remarks: '整体环境改善',
    },
    {
      id: '5',
      streetName: '和平路',
      oldRating: 4.1,
      newRating: 4.2,
      change: 0.1,
      evaluator: 'admin',
      evaluationDate: '2024-01-11 11:00',
      category: '次干道',
      remarks: '人行道清洁度提升',
    },
    {
      id: '6',
      streetName: '胜利路',
      oldRating: 4.1,
      newRating: 4.0,
      change: -0.1,
      evaluator: 'developer',
      evaluationDate: '2024-01-10 15:30',
      category: '次干道',
      remarks: '需要加强维护',
    },
    {
      id: '7',
      streetName: '光明路',
      oldRating: 3.5,
      newRating: 3.8,
      change: 0.3,
      evaluator: 'admin',
      evaluationDate: '2024-01-09 10:00',
      category: '次干道',
      remarks: '照明设施改善',
    },
    {
      id: '8',
      streetName: '前进路',
      oldRating: 3.8,
      newRating: 3.6,
      change: -0.2,
      evaluator: 'developer',
      evaluationDate: '2024-01-08 14:15',
      category: '次干道',
      remarks: '垃圾清理不及时',
    },
    {
      id: '9',
      streetName: '红旗路',
      oldRating: 3.4,
      newRating: 3.5,
      change: 0.1,
      evaluator: 'admin',
      evaluationDate: '2024-01-07 09:30',
      category: '支路',
      remarks: '社区环境改善',
    },
    {
      id: '10',
      streetName: '幸福路',
      oldRating: 3.4,
      newRating: 3.3,
      change: -0.1,
      evaluator: 'developer',
      evaluationDate: '2024-01-06 16:00',
      category: '支路',
      remarks: '需要提升绿化',
    },
  ];

  const filteredData = selectedStreet === 'all' 
    ? mockHistory 
    : mockHistory.filter(item => item.streetName === selectedStreet);

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime();
    if (sortBy === 'change') return Math.abs(b.change) - Math.abs(a.change);
    return 0;
  });

  const totalEvaluations = mockHistory.length;
  const positiveChanges = mockHistory.filter(item => item.change > 0).length;
  const negativeChanges = mockHistory.filter(item => item.change < 0).length;
  const averageChange = mockHistory.reduce((sum, item) => sum + item.change, 0) / mockHistory.length;

  const getChangeColor = (change: number) => {
    if (change > 0) return '#52c41a';
    if (change < 0) return '#ff4d4f';
    return '#999';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 4.0) return '#73d13d';
    if (rating >= 3.5) return '#faad14';
    if (rating >= 3.0) return '#fa8c16';
    return '#ff4d4f';
  };

  const streets = Array.from(new Set(mockHistory.map(item => item.streetName)));

  return (
    <div className="rating-history-container">
      <Card title="评级历史">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic title="总评估次数" value={totalEvaluations} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="评分提升" value={positiveChanges} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="评分下降" value={negativeChanges} valueStyle={{ color: '#ff4d4f' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="平均变化" value={averageChange} precision={2} suffix="分" />
              </Card>
            </Col>
          </Row>

          <Card title="筛选条件" style={{ marginTop: 16 }}>
            <Space>
              <span>街道名称：</span>
              <Select
                value={selectedStreet}
                onChange={setSelectedStreet}
                style={{ width: 200 }}
              >
                <Option value="all">全部街道</Option>
                {streets.map(street => (
                  <Option key={street} value={street}>{street}</Option>
                ))}
              </Select>
              <span>排序方式：</span>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 150 }}
              >
                <Option value="date">按时间</Option>
                <Option value="change">按变化幅度</Option>
              </Select>
            </Space>
          </Card>

          <Card title="评估历史时间线" style={{ marginTop: 16 }}>
            <Timeline
              mode="left"
              items={sortedData.map(record => ({
                color: record.change > 0 ? 'green' : record.change < 0 ? 'red' : 'blue',
                dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                children: (
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <Tag color="blue">{record.category}</Tag>
                          <strong>{record.streetName}</strong>
                        </Space>
                        <span style={{ color: '#999', fontSize: 12 }}>{record.evaluationDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <Space>
                          <span>评分：</span>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#999',
                            marginRight: 8 
                          }}>
                            {record.oldRating.toFixed(1)}
                          </span>
                          <ArrowUpOutlined style={{ color: getChangeColor(record.change), fontSize: 14 }} />
                          <span style={{ 
                            color: getRatingColor(record.newRating), 
                            fontWeight: 'bold',
                            fontSize: 16 
                          }}>
                            {record.newRating.toFixed(1)}
                          </span>
                        </Space>
                        <Tag color={record.change > 0 ? 'green' : record.change < 0 ? 'red' : 'default'}>
                          {record.change > 0 ? '+' : ''}{record.change.toFixed(1)}
                        </Tag>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{ color: '#666' }}>评估者：</span>
                        <span style={{ marginLeft: 8 }}>{record.evaluator}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span style={{ color: '#666' }}>备注：</span>
                        <span style={{ marginLeft: 8 }}>{record.remarks}</span>
                      </div>
                    </Space>
                  </Card>
                ),
              }))}
            />
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default RatingHistoryPage;