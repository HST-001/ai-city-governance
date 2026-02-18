import React from 'react';
import { Card, Row, Col, Progress, Tag, Typography, List, Divider } from 'antd';
import { ArrowUpOutlined, InfoCircleOutlined, StarFilled, EnvironmentOutlined, BulbOutlined } from '@ant-design/icons';
import { RatingResult, Suggestion, RatingDimension } from '../types/rating';

const { Title, Text, Paragraph } = Typography;

interface RatingResultCardProps {
  ratingResult: RatingResult | null;
  suggestions?: Suggestion[];
  showSuggestions?: boolean;
}

// 评分维度对应的图标和颜色
const dimensionConfig = {
  visual_quality: { icon: <StarFilled />, color: '#f5222d', name: '视觉质量' },
  lighting: { icon: <StarFilled />, color: '#faad14', name: '光线条件' },
  composition: { icon: <StarFilled />, color: '#1890ff', name: '构图' },
  color_balance: { icon: <StarFilled />, color: '#52c41a', name: '色彩平衡' },
  clarity: { icon: <StarFilled />, color: '#722ed1', name: '清晰度' },
  urban_planning: { icon: <EnvironmentOutlined />, color: '#13c2c2', name: '城市规划' },
  green_space: { icon: <EnvironmentOutlined />, color: '#52c41a', name: '绿地覆盖' },
  infrastructure: { icon: <EnvironmentOutlined />, color: '#faad14', name: '基础设施' },
  cleanliness: { icon: <EnvironmentOutlined />, color: '#1890ff', name: '整洁度' },
  cultural_elements: { icon: <EnvironmentOutlined />, color: '#eb2f96', name: '文化元素' },
};

// 根据分数获取颜色
const getScoreColor = (score: number, maxScore: number): string => {
  const percentage = score / maxScore;
  if (percentage < 0.6) return '#f5222d'; // 红色
  if (percentage < 0.8) return '#faad14'; // 黄色
  if (percentage < 0.9) return '#1890ff'; // 蓝色
  return '#52c41a'; // 绿色
};

// 根据分数获取标签
const getScoreTag = (score: number, maxScore: number): string => {
  const percentage = score / maxScore;
  if (percentage < 0.6) return '需要改进';
  if (percentage < 0.8) return '良好';
  if (percentage < 0.9) return '优秀';
  return '卓越';
};

// 建议优先级对应的颜色和图标
const getSuggestionPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
  const configs = {
    high: { color: '#f5222d', icon: <ArrowUpOutlined /> },
    medium: { color: '#faad14', icon: <ArrowUpOutlined /> },
    low: { color: '#52c41a', icon: <ArrowUpOutlined /> },
  };
  return configs[priority];
};

// 建议类型对应的标签和颜色
const getSuggestionTypeConfig = (type: 'improvement' | 'maintenance' | 'enhancement') => {
  const configs = {
    improvement: { text: '改进', color: '#1890ff' },
    maintenance: { text: '维护', color: '#52c41a' },
    enhancement: { text: '增强', color: '#faad14' },
  };
  return configs[type];
};

// 评分维度组件
interface DimensionCardProps {
  dimension: RatingDimension;
  score: number;
  maxScore: number;
  description?: string;
  tips?: string[];
}

const DimensionCard: React.FC<DimensionCardProps> = ({ dimension, score, maxScore, description, tips }) => {
  const config = dimensionConfig[dimension];
  const scoreColor = getScoreColor(score, maxScore);
  const percentage = (score / maxScore) * 100;
  
  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: config.color }}>{config.icon}</span>
          <span>{config.name}</span>
          <span style={{ marginLeft: 'auto', color: scoreColor, fontWeight: 'bold' }}>
            {score}/{maxScore}
          </span>
        </div>
      }
      size="small"
      className="dimension-card"
      headStyle={{ padding: '8px 16px' }}
    >
      <Progress
        percent={percentage}
        strokeColor={scoreColor}
        strokeWidth={10}
        showInfo={false}
        style={{ marginBottom: '8px' }}
      />
      
      {description && (
        <Paragraph 
          type="secondary" 
          style={{ marginBottom: '8px', fontSize: '14px', lineHeight: '1.5' }}
        >
          {description}
        </Paragraph>
      )}
      
      {tips && tips.length > 0 && (
        <List
          size="small"
          bordered
          dataSource={tips}
          renderItem={tip => (
            <List.Item className="tip-item">
              <BulbOutlined style={{ marginRight: '8px', color: '#faad14' }} />
              {tip}
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

// 建议卡片组件
interface SuggestionCardProps {
  suggestion: Suggestion;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  const priorityConfig = getSuggestionPriorityConfig(suggestion.priority);
  const typeConfig = getSuggestionTypeConfig(suggestion.type);
  
  return (
    <Card 
      size="small"
      className="suggestion-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BulbOutlined style={{ color: priorityConfig.color }} />
          <span>{suggestion.title}</span>
          <Tag color={typeConfig.color} style={{ marginLeft: '8px' }}>{typeConfig.text}</Tag>
          <Tag color={priorityConfig.color} style={{ marginLeft: 'auto' }}>
            {priorityConfig.icon} 优先级{suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}
          </Tag>
        </div>
      }
      headStyle={{ padding: '8px 16px' }}
    >
      <Paragraph style={{ marginBottom: '8px', fontSize: '14px' }}>
        {suggestion.description}
      </Paragraph>
      
      {suggestion.expectedImpact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          <InfoCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            预期改进效果: {suggestion.expectedImpact > 0 ? '+' : ''}{suggestion.expectedImpact}%
          </Text>
        </div>
      )}
    </Card>
  );
};

// 评分结果展示组件接口
const RatingResultCard: React.FC<RatingResultCardProps> = ({ ratingResult, suggestions = [], showSuggestions = true }) => {
  if (!ratingResult) {
    return null;
  }
  
  const { overallScore, maxScore, dimensions, feedback } = ratingResult;
  const scoreColor = getScoreColor(overallScore, maxScore);
  const percentage = (overallScore / maxScore) * 100;
  const scoreTag = getScoreTag(overallScore, maxScore);
  
  // 按分数降序排序维度
  const sortedDimensions = [...dimensions].sort((a, b) => {
    const scoreA = a.score / a.maxScore;
    const scoreB = b.score / b.maxScore;
    return scoreB - scoreA;
  });
  
  // 低分维度（需要改进的维度）
  const lowScoreDimensions = sortedDimensions.filter(dim => dim.score / dim.maxScore < 0.8);
  
  return (
    <Card 
      className="rating-result-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarFilled style={{ color: '#fadb14' }} />
            <Title level={4} style={{ margin: 0 }}>照片评分结果</Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: scoreColor }}>
              {overallScore.toFixed(1)}/{maxScore}
            </Text>
            <Tag color={scoreColor} style={{ fontSize: '14px', height: '24px', lineHeight: '24px' }}>
              {scoreTag}
            </Tag>
          </div>
        </div>
      }
    >
      
      {/* 总体评分进度条 */}
      <Progress
        percent={percentage}
        strokeColor={scoreColor}
        strokeWidth={16}
        showInfo={false}
        style={{ marginBottom: '24px' }}
      />
      
      {/* 综合反馈 */}
      {feedback && (
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ marginBottom: '8px', display: 'block' }}>综合反馈：</Text>
          <Paragraph type="secondary"
            style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {feedback}
          </Paragraph>
        </div>
      )}
      
      {/* 评分维度详情 */}
      <div style={{ marginBottom: '24px' }}>
        <Text strong style={{ marginBottom: '16px', display: 'block' }}>维度详情：</Text>
        <Row gutter={[16, 16]}>
          {sortedDimensions.map((dim) => (
            <Col xs={24} sm={12} md={8} key={dim.dimension}>
              <DimensionCard
                dimension={dim.dimension}
                score={dim.score}
                maxScore={dim.maxScore}
                description={dim.description}
                tips={dim.tips}
              />
            </Col>
          ))}
        </Row>
      </div>
      
      {/* 需要改进的领域 */}
      {lowScoreDimensions.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff7e6', borderRadius: '4px', border: '1px solid #ffd591' }}>
          <Text strong style={{ color: '#d46b08', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <InfoCircleOutlined /> 需要重点改进的领域：
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {lowScoreDimensions.map(dim => (
              <Tag color="#fa8c16" key={dim.dimension}>
                {dimensionConfig[dim.dimension].name}
              </Tag>
            ))}
          </div>
        </div>
      )}
      
      {/* 改进建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          <Divider style={{ margin: '24px 0 16px' }} orientation="left">改进建议</Divider>
          <Row gutter={[16, 16]}>
            {suggestions.map((suggestion) => (
              <Col xs={24} sm={12} key={suggestion.id}>
                <SuggestionCard suggestion={suggestion} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Card>
  );
};

export default RatingResultCard;