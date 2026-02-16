import React, { useState, useEffect } from 'react';
import { Tabs, Typography, Spin, Empty, Alert, Form, Input, Button, Switch, Select, Card, Space, Divider } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { Permission } from '../types/rolePermissions';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 评分项目权重设置
const RatingWeightConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // 初始权重配置
  const initialWeights = {
    shopSignBuilding: 0.125,
    greeneryMaintenance: 0.125,
    greeneryCoverage: 0.125,
    sidewalkDamage: 0.125,
    bikeLaneConnectivity: 0.125,
    urbanFacilitiesIntegrity: 0.125,
    urbanFacilitiesDamage: 0.125,
    other: 0.125,
  };
  
  useEffect(() => {
    // 加载已保存的权重配置
    const loadConfig = async () => {
      setLoading(true);
      try {
        // 在实际应用中，这里会从API加载配置
        // 这里使用模拟数据
        setTimeout(() => {
          form.setFieldsValue(initialWeights);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('加载权重配置失败:', error);
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [form]);
  
  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      // 在实际应用中，这里会保存到API
      setTimeout(() => {
        setLoading(false);
        setSaved(true);
        
        // 3秒后清除保存成功提示
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error('保存权重配置失败:', error);
    }
  };
  
  return (
    <div>
      <Title level={4}>评分项目权重设置</Title>
      <Form form={form} layout="vertical">
        <Form.Item name="shopSignBuilding" label="店招/建筑美观度" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="greeneryMaintenance" label="绿化养护达标度" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="greeneryCoverage" label="绿化覆盖率" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="sidewalkDamage" label="人行道破损程度" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="bikeLaneConnectivity" label="自行车道连通性" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="urbanFacilitiesIntegrity" label="城市设施/家具完善度" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="urbanFacilitiesDamage" label="城市设施/家具破损程度" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="other" label="其他" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入权重值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存配置
          </Button>
        </Form.Item>
      </Form>
      
      {saved && (
        <Alert 
          message="配置保存成功" 
          type="success" 
          showIcon 
          style={{ marginTop: 16 }}
          closable
        />
      )}
    </div>
  );
};

// 评分阈值设置
const RatingThresholdConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // 初始阈值配置
  const initialThresholds = {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 40,
  };
  
  useEffect(() => {
    // 加载已保存的阈值配置
    const loadConfig = async () => {
      setLoading(true);
      try {
        // 在实际应用中，这里会从API加载配置
        // 这里使用模拟数据
        setTimeout(() => {
          form.setFieldsValue(initialThresholds);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('加载阈值配置失败:', error);
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [form]);
  
  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      // 在实际应用中，这里会保存到API
      setTimeout(() => {
        setLoading(false);
        setSaved(true);
        
        // 3秒后清除保存成功提示
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error('保存阈值配置失败:', error);
    }
  };
  
  return (
    <div>
      <Title level={4}>评分等级阈值设置</Title>
      <Form form={form} layout="vertical">
        <Form.Item name="excellent" label="优秀 (≥)" rules={[{ required: true, min: 0, max: 100 }]}>
          <Input type="number" placeholder="输入分数阈值" min={0} max={100} />
        </Form.Item>
        
        <Form.Item name="good" label="良好 (≥)" rules={[{ required: true, min: 0, max: 100 }]}>
          <Input type="number" placeholder="输入分数阈值" min={0} max={100} />
        </Form.Item>
        
        <Form.Item name="fair" label="一般 (≥)" rules={[{ required: true, min: 0, max: 100 }]}>
          <Input type="number" placeholder="输入分数阈值" min={0} max={100} />
        </Form.Item>
        
        <Form.Item name="poor" label="较差 (≥)" rules={[{ required: true, min: 0, max: 100 }]}>
          <Input type="number" placeholder="输入分数阈值" min={0} max={100} />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存配置
          </Button>
        </Form.Item>
      </Form>
      
      {saved && (
        <Alert 
          message="配置保存成功" 
          type="success" 
          showIcon 
          style={{ marginTop: 16 }}
          closable
        />
      )}
    </div>
  );
};

// 模型参数配置
const ModelParamsConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // 初始模型参数
  const initialParams = {
    confidenceThreshold: 0.7,
    processingTimeout: 30,
    batchSize: 10,
    enableAutoTraining: true,
    trainingFrequency: 'monthly',
  };
  
  useEffect(() => {
    // 加载已保存的模型参数
    const loadConfig = async () => {
      setLoading(true);
      try {
        // 在实际应用中，这里会从API加载配置
        // 这里使用模拟数据
        setTimeout(() => {
          form.setFieldsValue(initialParams);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('加载模型参数失败:', error);
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [form]);
  
  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      // 在实际应用中，这里会保存到API
      setTimeout(() => {
        setLoading(false);
        setSaved(true);
        
        // 3秒后清除保存成功提示
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error('保存模型参数失败:', error);
    }
  };
  
  return (
    <div>
      <Title level={4}>模型参数配置</Title>
      <Form form={form} layout="vertical">
        <Form.Item name="confidenceThreshold" label="置信度阈值" rules={[{ required: true, min: 0, max: 1 }]}>
          <Input type="number" placeholder="输入置信度阈值 (0-1)" min={0} max={1} step={0.01} />
        </Form.Item>
        
        <Form.Item name="processingTimeout" label="处理超时时间(秒)" rules={[{ required: true, min: 5, max: 300 }]}>
          <Input type="number" placeholder="输入超时时间" min={5} max={300} />
        </Form.Item>
        
        <Form.Item name="batchSize" label="批处理大小" rules={[{ required: true, min: 1, max: 100 }]}>
          <Input type="number" placeholder="输入批处理大小" min={1} max={100} />
        </Form.Item>
        
        <Form.Item name="enableAutoTraining" label="启用自动训练">
          <Switch />
        </Form.Item>
        
        <Form.Item name="trainingFrequency" label="训练频率" rules={[{ required: true }]}>
          <Select placeholder="选择训练频率">
            <Option value="weekly">每周</Option>
            <Option value="monthly">每月</Option>
            <Option value="quarterly">每季度</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存配置
          </Button>
        </Form.Item>
      </Form>
      
      {saved && (
        <Alert 
          message="配置保存成功" 
          type="success" 
          showIcon 
          style={{ marginTop: 16 }}
          closable
        />
      )}
    </div>
  );
};

const ModelConfig: React.FC = () => {
  const { hasPermission } = useAuth();
  
  // 检查用户是否有权限配置模型
  const canConfigureModels = hasPermission(Permission.CONFIGURE_MODELS);
  const [activeKey, setActiveKey] = useState('1');
  
  if (!canConfigureModels) {
    return (
      <div>
        <Alert
          message="权限不足"
          description="您没有权限配置模型参数，请联系管理员获取权限。"
          type="warning"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div>
      <Title level={2}>模型配置</Title>
      <Divider />
      <Tabs 
        activeKey={activeKey} 
        onChange={setActiveKey}
        items={[
          {
            key: '1',
            label: '评分权重',
            children: <RatingWeightConfig />,
          },
          {
            key: '2',
            label: '评分阈值',
            children: <RatingThresholdConfig />,
          },
          {
            key: '3',
            label: '模型参数',
            children: <ModelParamsConfig />,
          },
        ]}
      />
    </div>
  );
};

export default ModelConfig;