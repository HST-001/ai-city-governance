import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Upload, message, Progress, Select, Typography, Row, Col, Alert } from 'antd';
import { UploadOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { Permission } from '../types/rolePermissions';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Training: React.FC = () => {
  const { hasPermission } = useAuth();
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [modelType, setModelType] = useState<string>('image_quality');
  const [trainingData, setTrainingData] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // 检查用户是否有权限访问此页面
  useEffect(() => {
    if (!hasPermission(Permission.TRAIN_MODELS)) {
      message.error('您没有权限访问此页面');
    }
  }, [hasPermission]);

  // 模拟训练进度
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTraining && progress < 100) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 1;
          // 添加训练日志
          if (newProgress % 10 === 0) {
            setLogs((prevLogs) => [
              ...prevLogs,
              `[${new Date().toLocaleTimeString()}] 训练进度: ${newProgress}%, 完成第 ${newProgress/10} 轮迭代`
            ]);
          }
          return newProgress;
        });
      }, 200);
    } else if (progress >= 100) {
      setIsTraining(false);
      message.success('模型训练完成！');
      setLogs((prevLogs) => [
        ...prevLogs,
        `[${new Date().toLocaleTimeString()}] 训练成功完成！模型已保存。`
      ]);
    }
    return () => clearInterval(interval);
  }, [isTraining, progress]);

  // 处理开始训练
  const handleStartTraining = () => {
    if (uploadedFiles.length === 0) {
      message.error('请先上传训练数据');
      return;
    }
    setIsTraining(true);
    setProgress(0);
    setLogs(['[${new Date().toLocaleTimeString()}] 开始训练模型...']);
  };

  // 处理暂停训练
  const handlePauseTraining = () => {
    setIsTraining(false);
    setLogs((prevLogs) => [
      ...prevLogs,
      `[${new Date().toLocaleTimeString()}] 训练已暂停。`
    ]);
  };

  // 处理文件上传
  const handleUpload = (info: any) => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      setUploadedFiles([...uploadedFiles, info.file]);
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  // 处理模型类型选择
  const handleModelTypeChange = (value: string) => {
    setModelType(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      {!hasPermission(Permission.TRAIN_MODELS) && (
        <Alert
          message="无权限访问"
          description="您没有权限访问模型训练页面，请联系管理员"
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      <Title level={2}>模型训练系统</Title>
      <Paragraph>此页面用于训练和优化AI评估模型，仅开发人员可访问</Paragraph>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="训练配置" style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>模型类型:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={modelType}
                    onChange={handleModelTypeChange}
                    disabled={isTraining}
                  >
                    <Option value="image_quality">图像质量评估模型</Option>
                    <Option value="street_condition">街道状况评估模型</Option>
                    <Option value="object_detection">目标检测模型</Option>
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>训练描述:</Text>
                  <TextArea
                    rows={4}
                    value={trainingData}
                    onChange={(e) => setTrainingData(e.target.value)}
                    placeholder="输入训练描述或备注"
                    disabled={isTraining}
                  />
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>上传训练数据集:</Text>
              <Upload.Dragger
                name="file"
                multiple
                onChange={handleUpload}
                beforeUpload={() => false} // 阻止默认上传，实际应用中应连接后端API
                disabled={isTraining}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">支持单个或批量上传训练数据集</p>
              </Upload.Dragger>
            </div>

            <div style={{ textAlign: 'center' }}>
              {!isTraining && (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  onClick={handleStartTraining}
                  size="large"
                >
                  开始训练
                </Button>
              )}
              {isTraining && (
                <Button 
                  danger 
                  icon={<PauseCircleOutlined />} 
                  onClick={handlePauseTraining}
                  size="large"
                >
                  暂停训练
                </Button>
              )}
            </div>
          </Card>

          <Card title="训练进度" style={{ marginBottom: '20px' }}>
            <Progress
              percent={progress}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ marginTop: '16px' }}>
              <Text strong>已上传文件: {uploadedFiles.length} 个</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="训练日志">
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {logs.length > 0 ? (
                <div>
                  {logs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '8px', fontSize: '12px' }}>
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <Text type="secondary">训练尚未开始，无日志记录</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Training;
